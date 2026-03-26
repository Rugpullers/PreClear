"""
Traffic Data Simulator
Sends random traffic data to the backend every few seconds.
Simulates 5 predefined Bangalore locations.
"""
import time
import random
import requests
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(message)s")
logger = logging.getLogger(__name__)

# Backend URL — use localhost when running outside Docker
BACKEND_URL = "http://localhost:8085"

# Predefined Bangalore locations
LOCATIONS = [
    {"location_id": "LOC001", "name": "MG Road",        "lat": 12.9716, "lng": 77.5946},
    {"location_id": "LOC002", "name": "Koramangala",     "lat": 12.9352, "lng": 77.6245},
    {"location_id": "LOC003", "name": "Whitefield",      "lat": 12.9698, "lng": 77.7500},
    {"location_id": "LOC004", "name": "Indiranagar",     "lat": 12.9784, "lng": 77.6408},
    {"location_id": "LOC005", "name": "Electronic City", "lat": 12.8399, "lng": 77.6770},
]

INTERVAL_SECONDS = 3


def generate_traffic_data(location: dict) -> dict:
    """Generate random traffic data for a location with guaranteed diversity."""
    # Force LOC001 and LOC002 to be "LOW" for testing if they exist in subset
    if location["location_id"] in ["LOC001", "LOC002"]:
        if random.random() < 0.7: # 70% chance to be LOW
            vehicle_count = random.randint(5, 30)
            avg_speed = round(random.uniform(60.0, 90.0), 1)
        else:
            vehicle_count = random.randint(50, 80)
            avg_speed = round(random.uniform(30.0, 50.0), 1)
    else:
        # Others remain high/medium
        vehicle_count = random.randint(120, 200)
        avg_speed = round(random.uniform(5.0, 30.0), 1)

    return {
        "location_id": location["location_id"],
        "vehicle_count": vehicle_count,
        "avg_speed": avg_speed,
        "lat": location["lat"],
        "lng": location["lng"],
    }


def send_traffic_data(data: dict):
    """Send traffic data to backend."""
    try:
        response = requests.post(f"{BACKEND_URL}/traffic-data", json=data, timeout=5)
        result = response.json()
        logger.info(
            f"[{data['location_id']}] vehicles={data['vehicle_count']}, "
            f"speed={data['avg_speed']} → {result.get('traffic_level', 'N/A')} "
            f"(green={result.get('green_time', 'N/A')}s)"
        )
    except requests.exceptions.ConnectionError:
        logger.error(f"Cannot connect to backend at {BACKEND_URL}. Is it running?")
    except Exception as e:
        logger.error(f"Error sending data: {e}")


def simulate_incident():
    """Occasionally simulate an incident."""
    location = random.choice(LOCATIONS)
    incident_types = ["accident", "roadwork", "emergency_vehicle", "flooding"]
    severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    data = {
        "location_id": location["location_id"],
        "type": random.choice(incident_types),
        "severity": random.choice(severities),
        "description": f"Simulated incident at {location['name']}",
    }
    try:
        response = requests.post(f"{BACKEND_URL}/report-incident", json=data, timeout=5)
        result = response.json()
        override = result.get("override", {})
        logger.info(
            f"🚨 INCIDENT at {location['name']}: {data['type']} ({data['severity']}) "
            f"→ override={override.get('override_active', False)}"
        )
    except Exception as e:
        logger.error(f"Error reporting incident: {e}")


def main():
    logger.info("=" * 60)
    logger.info("   Traffic Data Simulator — Starting")
    logger.info(f"   Target: {BACKEND_URL}")
    logger.info(f"   Locations: {len(LOCATIONS)}")
    logger.info(f"   Interval: {INTERVAL_SECONDS}s")
    logger.info("=" * 60)

    cycle = 0
    while True:
        cycle += 1
        # Send data for a random subset of locations
        active_locations = random.sample(LOCATIONS, k=random.randint(2, len(LOCATIONS)))
        for loc in active_locations:
            data = generate_traffic_data(loc)
            send_traffic_data(data)

        # Every 10 cycles, simulate an incident
        if cycle % 10 == 0:
            simulate_incident()

        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
