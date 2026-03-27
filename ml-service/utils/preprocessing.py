"""
Preprocessing utilities for the ML service.
Mirrors the feature engineering logic from the training pipeline (fix_models.py).
"""

import numpy as np
import math
from typing import Dict, Any, List, Optional


# ── Peak hour classification ─────────────────────────────────

def get_peak_bucket(hour: int) -> int:
    """Classify hour into peak buckets matching training logic."""
    if 7 <= hour <= 9:
        return 2  # morning peak
    elif 17 <= hour <= 19:
        return 3  # evening peak
    elif 10 <= hour <= 16:
        return 1  # midday
    else:
        return 0  # off-peak


def is_peak_hour(peak_bucket: int) -> int:
    """Returns 1 if the hour is during peak traffic, else 0."""
    return 1 if peak_bucket in [2, 3] else 0


# ── Cyclical encoding ────────────────────────────────────────

def cyclical_encode(value: float, max_value: float) -> tuple:
    """Returns (sin, cos) encoding for a cyclical feature."""
    sin_val = math.sin(2 * math.pi * value / max_value)
    cos_val = math.cos(2 * math.pi * value / max_value)
    return sin_val, cos_val


# ── Feature builder ──────────────────────────────────────────

def build_lgbm_features(raw_data: Dict[str, Any], feature_list: List[str]) -> Dict[str, Any]:
    """
    Build LightGBM-compatible feature dict from raw traffic data.
    
    Accepts raw telemetry-like data and produces the engineered features
    expected by the trained model.
    """
    features = {}
    
    # Direct passthrough features
    direct_keys = [
        "hour", "is_weekend", "is_holiday", "month",
        "day_of_week_enc", "junction_name_enc",
        "weather_enc", "event_nearby_enc", "anomaly_cause_enc",
        "day", "weekday", "quarter",
    ]
    for key in direct_keys:
        if key in raw_data:
            features[key] = raw_data[key]
    
    # Derive time features if hour is available
    hour = raw_data.get("hour")
    if hour is not None:
        features["hour_sin"], features["hour_cos"] = cyclical_encode(hour, 24)
        pb = get_peak_bucket(hour)
        features["peak_bucket"] = pb
        features["is_peak_hour"] = is_peak_hour(pb)
    
    # Derive month features if month is available
    month = raw_data.get("month")
    if month is not None:
        features["month_sin"], features["month_cos"] = cyclical_encode(month, 12)
    
    # Rolling averages — use provided values or defaults
    features["rolling_avg_speed_3h"] = raw_data.get("rolling_avg_speed_3h", raw_data.get("avg_speed_kmh", 45))
    features["rolling_avg_count_3h"] = raw_data.get("rolling_avg_count_3h", raw_data.get("vehicle_count", 200))
    features["rolling_avg_delay_3h"] = raw_data.get("rolling_avg_delay_3h", raw_data.get("delay_minutes", 5.0))
    
    # Ensure all required features are present (fill missing with 0)
    result = {}
    for f in feature_list:
        result[f] = features.get(f, 0)
    
    return result


def build_lstm_features(raw_data: Dict[str, Any], feature_list: List[str]) -> List[float]:
    """
    Build LSTM-compatible feature vector from raw traffic data.
    Returns an ordered list of feature values matching the LSTM training order.
    """
    result = []
    for f in feature_list:
        result.append(float(raw_data.get(f, 0)))
    return result
