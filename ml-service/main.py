"""
ML Service — FastAPI Application Entry Point

Skeleton service that will load a pre-trained model when uploaded.
Currently uses rule-based fallback for predictions.
"""
import os
import logging
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient

# ── Logging ──────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── Config ───────────────────────────────────────────────────

MONGO_ML_URL = os.getenv("MONGO_ML_URL", "mongodb://mongodb_ml:27018")
MONGO_ML_DB = os.getenv("MONGO_ML_DB", "traffic_ml")
MODEL_PATH = os.getenv("MODEL_PATH", "ml_service/model/xgboost_traffic_congestion.json")
FEATURE_MEANS_PATH = os.getenv("FEATURE_MEANS_PATH", "ml_service/model/feature_means.json")
MODEL_VERSION = "2.0.0-xgboost"

# ── Globals ──────────────────────────────────────────────────

ml_model = None
feature_means_data = None
mongo_client: Optional[AsyncIOMotorClient] = None
db = None


def load_model():
    """Try to load a pre-trained model. Falls back to None if not found."""
    global ml_model, feature_means_data, MODEL_VERSION
    try:
        import xgboost as xgb
        import json
        
        if os.path.exists(MODEL_PATH) and os.path.exists(FEATURE_MEANS_PATH):
            ml_model = xgb.XGBClassifier()
            ml_model.load_model(MODEL_PATH)
            
            with open(FEATURE_MEANS_PATH, "r") as f:
                feature_means_data = json.load(f)
                
            MODEL_VERSION = "2.0.0-xgboost"
            logger.info(f"ML model loaded from {MODEL_PATH}")
        else:
            logger.warning(f"Model files missing (need {MODEL_PATH} and {FEATURE_MEANS_PATH}). Using rule-based fallback.")
            ml_model = None
    except Exception as e:
        logger.error(f"Failed to load model: {e}. Using rule-based fallback.")
        ml_model = None


# ── Lifespan ─────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global mongo_client, db
    logger.info("Starting ML Service...")
    # Load model
    load_model()
    # Connect to MongoDB ML
    try:
        mongo_client = AsyncIOMotorClient(MONGO_ML_URL)
        db = mongo_client[MONGO_ML_DB]
        await mongo_client.admin.command("ping")
        logger.info(f"Connected to MongoDB ML at {MONGO_ML_URL}/{MONGO_ML_DB}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB ML: {e}")
    yield
    if mongo_client:
        mongo_client.close()
    logger.info("ML Service shut down.")


# ── FastAPI App ──────────────────────────────────────────────

app = FastAPI(
    title="Intelligent Traffic Management System — ML Service",
    description="ML prediction service for traffic level classification.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Models ─────────────────────────────────────────

class PredictInput(BaseModel):
    vehicle_count: int = Field(..., ge=0)
    avg_speed: float = Field(..., ge=0)
    hour: int = 8
    day: str = "Monday"
    weather: str = "Clear"
    junction: str = "Silk Board Junction"


class PredictOutput(BaseModel):
    traffic_level: str
    confidence: float


# ── Prediction Logic ────────────────────────────────────────

def rule_based_predict(data: PredictInput) -> tuple:
    """Fallback rule-based prediction."""
    if data.vehicle_count > 120 or data.avg_speed < 20:
        return "HIGH", 0.75
    elif data.vehicle_count > 60 or data.avg_speed < 40:
        return "MEDIUM", 0.70
    else:
        return "LOW", 0.80


def model_predict(data: PredictInput) -> tuple:
    """Use trained ML model for prediction."""
    import pandas as pd
    import numpy as np
    
    if not feature_means_data:
        return rule_based_predict(data)

    # Base defaults
    row = dict(feature_means_data["means"])
    
    # Overrides
    row["vehicle_count"] = data.vehicle_count
    row["avg_speed_kmh"] = data.avg_speed
    
    h = data.hour
    row["hour"] = h
    row["hour_sin"] = np.sin(2 * np.pi * h / 24)
    row["hour_cos"] = np.cos(2 * np.pi * h / 24)
    row["is_peak_morning"] = int(8 <= h <= 10)
    row["is_peak_evening"] = int(17 <= h <= 20)
    row["is_night"] = int(h <= 5 or h >= 22)
    row["is_peak"] = int(8 <= h <= 10 or h >= 17 and h <= 20)
    
    day_map = {"Monday":0,"Tuesday":1,"Wednesday":2,"Thursday":3,"Friday":4,"Saturday":5,"Sunday":6}
    dow = day_map.get(data.day, 0)
    row["day_of_week_enc"] = dow
    row["is_weekend"] = int(dow >= 5)
    
    weather_map = {"Clear":0,"Cloudy":1,"Fog":2,"Heavy Rain":3,"Rain":4}
    row["weather_enc"] = weather_map.get(data.weather, 0)

    # We skip junction_name encoding and use the mean/default
    
    X_input = pd.DataFrame([row], columns=feature_means_data["columns"])
    
    prediction = ml_model.predict(X_input)[0]
    probabilities = ml_model.predict_proba(X_input)[0]
    confidence = float(max(probabilities))
    
    label_map = {0: "HIGH", 1: "LOW", 2: "MEDIUM"}
    traffic_level = label_map.get(int(prediction), str(prediction))
    return traffic_level, confidence


async def log_prediction(input_data: dict, processed: dict, prediction: dict):
    """Log prediction to MongoDB ML."""
    try:
        if db is not None:
            log_doc = {
                "input": input_data,
                "processed_features": processed,
                "prediction": prediction,
                "model_version": MODEL_VERSION,
                "timestamp": datetime.utcnow(),
            }
            await db["ml_logs"].insert_one(log_doc)
    except Exception as e:
        logger.error(f"Failed to log prediction: {e}")


# ── Endpoints ────────────────────────────────────────────────

@app.post("/predict", response_model=PredictOutput)
async def predict(data: PredictInput):
    """Predict traffic level from vehicle count and average speed."""
    input_data = data.model_dump()
    processed = {
        "vehicle_count": data.vehicle_count,
        "avg_speed": data.avg_speed,
        "speed_density_ratio": data.avg_speed / max(data.vehicle_count, 1),
    }

    if ml_model is not None:
        traffic_level, confidence = model_predict(data)
    else:
        traffic_level, confidence = rule_based_predict(data)

    result = {"traffic_level": traffic_level, "confidence": round(confidence, 4)}

    # Log to MongoDB
    await log_prediction(input_data, processed, result)

    return PredictOutput(**result)


@app.post("/debug-predict")
async def debug_predict(data: PredictInput):
    """Verbose prediction with raw input, processed features, prediction, and model version."""
    input_data = data.model_dump()
    processed = {
        "vehicle_count": data.vehicle_count,
        "avg_speed": data.avg_speed,
        "speed_density_ratio": data.avg_speed / max(data.vehicle_count, 1),
    }

    if ml_model is not None:
        traffic_level, confidence = model_predict(data)
        model_type = "XGBoost"
    else:
        traffic_level, confidence = rule_based_predict(data)
        model_type = "RuleBasedFallback"

    prediction = {"traffic_level": traffic_level, "confidence": round(confidence, 4)}

    # Log to MongoDB
    await log_prediction(input_data, processed, prediction)

    return {
        "raw_input": input_data,
        "processed_features": processed,
        "prediction": prediction,
        "model_version": MODEL_VERSION,
        "model_type": model_type,
        "model_loaded": ml_model is not None,
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ml-service",
        "model_loaded": ml_model is not None,
        "model_version": MODEL_VERSION,
    }


@app.get("/")
async def root():
    return {
        "service": "Intelligent Traffic Management System — ML Service",
        "version": "1.0.0",
        "model_loaded": ml_model is not None,
        "endpoints": [
            "POST /predict",
            "POST /debug-predict",
            "GET  /health",
        ],
    }
