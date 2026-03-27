from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
import joblib
import lightgbm as lgb
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Global model references ──────────────────────────────────
lgbm_model = None
lstm_model = None
scaler = None
lgbm_features = None
lstm_features = None

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

CONGESTION_LABELS = {0: "High", 1: "Low", 2: "Medium"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup, release on shutdown."""
    global lgbm_model, lstm_model, scaler, lgbm_features, lstm_features

    logger.info("Loading ML models...")

    # LightGBM
    lgbm_path = os.path.join(MODEL_DIR, "lgbm_traffic_classifier.txt")
    lgbm_model = lgb.Booster(model_file=lgbm_path)
    logger.info(f"  ✅ LightGBM loaded ({lgbm_path})")

    # LSTM (lazy import to keep startup light if tensorflow is slow)
    try:
        from tensorflow.keras.models import load_model as keras_load
        lstm_path = os.path.join(MODEL_DIR, "lstm_traffic_forecaster.keras")
        lstm_model = keras_load(lstm_path)
        logger.info(f"  ✅ LSTM loaded ({lstm_path})")
    except Exception as e:
        logger.warning(f"  ⚠️ LSTM not loaded (will use LightGBM only): {e}")
        lstm_model = None

    # Scaler
    scaler_path = os.path.join(MODEL_DIR, "lstm_minmax_scaler.pkl")
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        logger.info(f"  ✅ Scaler loaded ({scaler_path})")

    # Feature lists
    lgbm_fl = os.path.join(MODEL_DIR, "lgbm_feature_list.pkl")
    lstm_fl = os.path.join(MODEL_DIR, "lstm_feature_list.pkl")
    if os.path.exists(lgbm_fl):
        lgbm_features = joblib.load(lgbm_fl)
        logger.info(f"  ✅ LightGBM feature list: {lgbm_features}")
    if os.path.exists(lstm_fl):
        lstm_features = joblib.load(lstm_fl)
        logger.info(f"  ✅ LSTM feature list: {lstm_features}")

    logger.info("All models loaded successfully.")
    yield
    logger.info("Shutting down ML Service.")


app = FastAPI(
    title="PreClear ML Service",
    description="Traffic congestion prediction microservice (LightGBM + LSTM)",
    version="1.0.0",
    lifespan=lifespan,
)


# ── Schemas ──────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    """
    Accepts either:
      • A flat dict of features for a single LightGBM prediction, OR
      • A 'features' list for explicit feature ordering.
    """
    features: Optional[Dict[str, Any]] = None
    # Quick prediction with just junction_id (uses defaults)
    junction_id: Optional[str] = None
    hour: Optional[int] = None
    is_weekend: Optional[int] = None
    is_holiday: Optional[int] = None
    month: Optional[int] = None
    vehicle_count: Optional[int] = None
    avg_speed_kmh: Optional[int] = None
    delay_minutes: Optional[float] = None
    day_of_week_enc: Optional[int] = None
    junction_name_enc: Optional[int] = None
    weather_enc: Optional[int] = None
    event_nearby_enc: Optional[int] = None
    anomaly_cause_enc: Optional[int] = None


class PredictionResponse(BaseModel):
    predicted_level: str
    predicted_class: int
    probabilities: Dict[str, float]
    model_used: str


# ── Endpoints ────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "lgbm_loaded": lgbm_model is not None,
        "lstm_loaded": lstm_model is not None,
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Primary prediction endpoint using LightGBM.
    Accepts traffic feature data and returns congestion level.
    """
    try:
        # Build feature vector from request
        if request.features:
            feature_dict = request.features
        else:
            feature_dict = request.model_dump(exclude={"features"}, exclude_none=True)

        if not feature_dict:
            raise HTTPException(status_code=400, detail="No features provided")

        # Order features to match training
        if lgbm_features:
            # Fill missing features with 0
            ordered = [feature_dict.get(f, 0) for f in lgbm_features]
            X = np.array([ordered])
        else:
            X = np.array([list(feature_dict.values())])

        # Predict
        probabilities = lgbm_model.predict(X)[0]
        predicted_class = int(np.argmax(probabilities))
        predicted_level = CONGESTION_LABELS.get(predicted_class, "Unknown")

        prob_dict = {
            CONGESTION_LABELS.get(i, f"class_{i}"): float(f"{p:.4f}")
            for i, p in enumerate(probabilities)
        }

        return PredictionResponse(
            predicted_level=predicted_level,
            predicted_class=predicted_class,
            probabilities=prob_dict,
            model_used="LightGBM",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/batch")
async def predict_batch(requests: List[Dict[str, Any]]):
    """Batch prediction for multiple junctions at once."""
    results = []
    for req_data in requests:
        if lgbm_features:
            ordered = [req_data.get(f, 0) for f in lgbm_features]
        else:
            ordered = list(req_data.values())
        results.append(ordered)

    X = np.array(results)
    all_probs = lgbm_model.predict(X)

    predictions = []
    for probs in all_probs:
        cls = int(np.argmax(probs))
        predictions.append({
            "predicted_level": CONGESTION_LABELS.get(cls, "Unknown"),
            "predicted_class": cls,
            "probabilities": {
                CONGESTION_LABELS.get(i, f"class_{i}"): float(f"{p:.4f}")
                for i, p in enumerate(probs)
            },
        })
    return predictions
