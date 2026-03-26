"""
Decision logic for traffic signal timing and emergency overrides.
"""
import logging

logger = logging.getLogger(__name__)

# Signal timing mapping (seconds of green light)
SIGNAL_TIMING = {
    "HIGH": 90,
    "MEDIUM": 60,
    "LOW": 30,
}


def get_green_time(traffic_level: str) -> int:
    """Get green light duration based on traffic level."""
    return SIGNAL_TIMING.get(traffic_level.upper(), 60)


def get_explainable_reason(traffic_level: str, vehicle_count: int, avg_speed: float) -> str:
    """Generate a human-readable explanation for the prediction."""
    reasons = {
        "HIGH": f"High vehicle density ({vehicle_count} vehicles) and low average speed ({avg_speed:.1f} km/h) indicate heavy congestion",
        "MEDIUM": f"Moderate vehicle count ({vehicle_count} vehicles) with average speed ({avg_speed:.1f} km/h) suggests moderate traffic",
        "LOW": f"Low vehicle count ({vehicle_count} vehicles) with good average speed ({avg_speed:.1f} km/h) indicates free-flowing traffic",
    }
    return reasons.get(traffic_level.upper(), "Unable to determine traffic condition")


def apply_emergency_override(severity: str, current_green_time: int) -> dict:
    """
    Override signal timing for emergency situations.
    Returns override info including new timing and status.
    """
    severity = severity.upper()
    if severity == "CRITICAL":
        return {
            "override_active": True,
            "green_time": 120,
            "signal_mode": "EMERGENCY_GREEN",
            "message": "Emergency override: All signals set to emergency green for emergency vehicle passage",
        }
    elif severity == "HIGH":
        return {
            "override_active": True,
            "green_time": 100,
            "signal_mode": "PRIORITY_GREEN",
            "message": "High severity incident: Extended green time for clearance",
        }
    else:
        return {
            "override_active": False,
            "green_time": current_green_time,
            "signal_mode": "NORMAL",
            "message": "No override applied",
        }
