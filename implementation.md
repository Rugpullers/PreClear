# 🛠️ PreClear AI: Comprehensive Implementation Guide

This document provides a deep dive into the technical implementation of the PreClear AI system, covering the Machine Learning model, Backend logic, Frontend visualization, and the integration of these components.

---

## 🏗️ 1. System Architecture & Component Interaction

PreClear AI follows a microservices-inspired architecture to ensure independence between the simulation, intelligence, and presentation layers.

- **Data Source**: `simulate_traffic.py` (Telemetry)
- **Central Intelligence**: `backend/` (FastAPI)
- **Predictive Core**: `ml-service/` (Random Forest)
- **UI/UX**: `frontend/` (Leaflet + GSAP)

### Data Lifecycle
1. Telemetry is POSTed to the **Backend**.
2. Backend strips metadata and sends a **Feature Vector** to the **ML Service**.
3. ML Service returns a **Congestion Level** (0, 1, or 2).
4. **Decision Engine** (within Backend) calculates new signal timings.
5. Updates are pushed to the **Frontend** via WebSockets for real-time UI rendering.

---

## 🤖 2. Machine Learning Implementation

The predictive core is built using Scikit-Learn.

### A. Feature Engineering (7-Factor Vector)
| Feature | Type | Description |
| :--- | :--- | :--- |
| `vehicle_count` | Int | Real-time density per junction lane. |
| `avg_speed` | Float | Calculated flow velocity in km/h. |
| `time_of_day` | Int | 24-hour cycle representation. |
| `day_of_week` | Int | Binary or 0-6 encoding for weekend/weekday patterns. |
| `weather_impact`| Float | 0.0 (Clear) to 1.0 (Heavy Rain/Storm). |
| `event_nearby` | Bool | Flag for stadium events, rallies, or roadworks. |
| `emergency` | Bool | Active priority vehicle flag. |

### B. Model Choice
**Random Forest Classifier** was selected for its:
- Robustness against outliers in traffic data.
- Ability to handle both categorical (weather, events) and numerical data.
- Interpretability (Feature importance score).

---

## ⚡ 3. Backend & Decision Engine Logic

The backend is built with **FastAPI** for high performance and native async support.

### A. Signal Decision Engine (`decision.py`)
The engine uses a 60-second base cycle. The allocation of Green/Red time is dynamic:
- **Level 0 (Smooth)**: 30s Green / 30s Red (Standard).
- **Level 2 (Heavy)**: Green phase extended to 45s; cross-traffic Red phase extended.
- **Emergency Override**: All signals on the path are forced to Green. Cross-traffic is held at Red until the ambulance passes a "Safety Buffer" (e.g., 50m from junction).

### B. Scalable Data Handling
Using **Motor (Async MongoDB Driver)**, every telemetry point is saved with a timestamp to the `traffic_telemetry` collection. This allows for:
- Historical analysis and "Playback" of traffic events.
- Retraining the ML model on real-world edge cases detected during deployment.

---

## 🌐 4. Frontend & Animation Technicalities

### A. The "Sky-to-Street" Zoom
- **Vanta.js**: Renders the volumetric cloud intro.
- **GSAP ScrollTrigger**: Binds the scroll position to the index of 150+ high-quality WebP frames.
- **Morphing**: At the final frame (zoom level 19 on a map equivalent), the canvas fades, and the Leaflet map is initialized at the same geographic coordinates.

### B. Live Map (Leaflet.js)
- **Heatmap Overlay**: Uses `Leaflet.heat` with a 2-second polling interval (or WebSocket push) to visualize vehicle clusters.
- **Dynamic Markers**: Junctions are rendered as SVG CircleMarkers. The `fillColor` property is dynamically bound to the `congestion_level` received from the Backend.

---

## 🐳 5. Deployment & Orchestration

### Docker Compose Configuration
The `docker-compose.yml` ensures that:
1. **db**: The MongoDB container starts first.
2. **ml-service**: The prediction wrapper loads the `.joblib` model into memory.
3. **backend**: Configures the `ML_SERVICE_URL` and `MONGO_URI` environment variables before starting the Uvicorn server.

---

## 🏁 6. Future Implementation Roadmap
- **Traffic Forecasting**: Moving from "Current Status" to "T+30 minute" forecasting using LSTM (Long Short-Term Memory) networks.
- **IoT Integration**: Replacing `simulate_traffic.py` with real computer vision data (YOLO-based vehicle counting) from street cameras.
- **Smart City API**: Exposing an API for 3rd-party navigation apps (Waze/Google Maps) to suggest PreClear-optimized routes.
