"""
Data Feeder Service — Continuously feeds traffic records from the CSV dataset
into MongoDB so the frontend heatmap and routing update in real time.

Cycles through junction_traffic_clean.csv, inserting one batch (all 10 junctions)
every FEED_INTERVAL seconds. Also runs ML predictions on each batch to populate
the predictions collection used by the routing algorithm.
"""

import asyncio
import csv
import logging
import os
import random
from datetime import datetime
from typing import List, Dict, Any, Optional

import httpx

from db.mongo import get_database
from core.config import settings

logger = logging.getLogger(__name__)

FEED_INTERVAL = 4  # seconds between batches
CSV_PATH = os.environ.get(
    "FEED_CSV_PATH",
    "/app/data/junction_traffic_clean.csv",
)

# State
_feeder_task: Optional[asyncio.Task] = None
_is_running = False
_dataset: List[Dict[str, Any]] = []
_cursor = 0


def _load_dataset() -> List[Dict[str, Any]]:
    """Load and return the CSV dataset."""
    global _dataset
    if _dataset:
        return _dataset

    if not os.path.exists(CSV_PATH):
        logger.warning(f"Dataset not found at {CSV_PATH} — feeder disabled.")
        return []

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        _dataset = list(reader)

    logger.info(f"Loaded {len(_dataset)} records from {CSV_PATH}")
    return _dataset


def _get_next_batch() -> List[Dict[str, Any]]:
    """
    Get the next batch of records — one per junction (10 records).
    Cycles through the dataset endlessly.
    """
    global _cursor
    data = _load_dataset()
    if not data:
        return []

    batch_size = 10  # one per junction
    batch = []
    for i in range(batch_size):
        idx = (_cursor + i) % len(data)
        batch.append(data[idx])

    _cursor = (_cursor + batch_size) % len(data)
    return batch


async def _feed_loop():
    """Main feed loop — inserts batches into MongoDB and runs predictions."""
    global _is_running
    _is_running = True
    db = get_database()

    if db is None:
        logger.error("No database connection — feeder cannot start.")
        _is_running = False
        return

    traffic_col = db["traffic_data"]
    predictions_col = db["predictions"]
    ml_url = settings.ML_SERVICE_URL

    logger.info(f"Data feeder started (interval: {FEED_INTERVAL}s)")

    while _is_running:
        try:
            batch = _get_next_batch()
            if not batch:
                await asyncio.sleep(FEED_INTERVAL)
                continue

            now = datetime.utcnow()

            # Insert traffic records
            docs = []
            for row in batch:
                vehicle_count = int(row.get("vehicle_count", 200))
                # Add slight randomness to make it dynamic
                vehicle_count = max(50, vehicle_count + random.randint(-50, 50))

                doc = {
                    "junction_id": row["junction_name"],
                    "vehicle_count": vehicle_count,
                    "congestion_level": row.get("congestion_level", "Low"),
                    "timestamp": now,
                    "avg_speed_kmh": int(row.get("avg_speed_kmh", 45)),
                    "delay_minutes": float(row.get("delay_minutes", 5.0)),
                    "hour": int(row.get("hour", now.hour)),
                    "weather": row.get("weather", "Clear"),
                }
                docs.append(doc)

            await traffic_col.insert_many(docs)

            # Run ML predictions for each junction and store in predictions collection
            async with httpx.AsyncClient(timeout=10.0) as client:
                for doc in docs:
                    try:
                        features = {
                            "hour": doc["hour"],
                            "is_weekend": 0,
                            "vehicle_count": doc["vehicle_count"],
                            "avg_speed_kmh": doc["avg_speed_kmh"],
                        }
                        resp = await client.post(
                            f"{ml_url}/predict",
                            json={"features": features},
                        )
                        if resp.status_code == 200:
                            pred = resp.json()
                            await predictions_col.update_one(
                                {"location_id": doc["junction_id"]},
                                {
                                    "$set": {
                                        "location_id": doc["junction_id"],
                                        "traffic_level": pred.get("predicted_level", "Low"),
                                        "vehicle_count": doc["vehicle_count"],
                                        "timestamp": now,
                                    }
                                },
                                upsert=True,
                            )
                    except Exception as e:
                        logger.debug(f"Prediction failed for {doc['junction_id']}: {e}")

            logger.info(
                f"Fed {len(docs)} records | cursor={_cursor}/{len(_dataset)}"
            )

        except Exception as e:
            logger.error(f"Feeder error: {e}", exc_info=True)

        await asyncio.sleep(FEED_INTERVAL)

    logger.info("Data feeder stopped.")


async def start_feeder():
    """Start the background data feeder task."""
    global _feeder_task
    if _feeder_task and not _feeder_task.done():
        logger.info("Feeder already running.")
        return

    _load_dataset()
    if not _dataset:
        logger.warning("No dataset loaded — feeder not started.")
        return

    _feeder_task = asyncio.create_task(_feed_loop())
    logger.info("Data feeder task created.")


async def stop_feeder():
    """Stop the background data feeder task."""
    global _is_running, _feeder_task
    _is_running = False
    if _feeder_task:
        _feeder_task.cancel()
        try:
            await _feeder_task
        except asyncio.CancelledError:
            pass
        _feeder_task = None
    logger.info("Data feeder task stopped.")


def get_feeder_status() -> Dict[str, Any]:
    """Return current feeder status."""
    return {
        "running": _is_running,
        "dataset_size": len(_dataset),
        "cursor": _cursor,
        "interval_seconds": FEED_INTERVAL,
    }
