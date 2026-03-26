"""
Preprocessing utilities for ML features.
"""


def preprocess_features(vehicle_count: int, avg_speed: float) -> dict:
    """
    Process raw input into features for the ML model.
    Returns a dict of processed features.
    """
    return {
        "vehicle_count": vehicle_count,
        "avg_speed": avg_speed,
        "speed_density_ratio": avg_speed / max(vehicle_count, 1),
        "is_congested": vehicle_count > 100 and avg_speed < 30,
    }
