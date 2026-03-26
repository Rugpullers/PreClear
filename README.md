# Intelligent Traffic Management System

A microservices-based real-time traffic management platform with ML predictions, WebSocket streaming, and heatmap visualization.

## Architecture

```
Simulator → Backend (FastAPI :8000) → ML Service (FastAPI :8001)
                ↓                            ↓
         MongoDB App (:27017)          MongoDB ML (:27018)
                ↓
         WebSocket → Frontend (Leaflet Heatmap)
```

## Quick Start

### 1. Start all services with Docker Compose
```bash
docker-compose up --build -d
```

### 2. Verify services are running
```bash
docker-compose ps

# Health checks
curl http://localhost:8000/health
curl http://localhost:8001/health
```

### 3. Run the traffic simulator
```bash
pip install requests
python simulate_traffic.py
```

### 4. View the heatmap
Open `frontend/heatmap.html` in a browser.

## Services

| Service | Port | Description |
|---|---|---|
| Backend | 8000 | Data ingestion, decision logic, WebSocket, heatmap API |
| ML Service | 8001 | Traffic level prediction (rule-based fallback until model uploaded) |
| MongoDB App | 27017 | Operational data (traffic, predictions, incidents) |
| MongoDB ML | 27018 | ML experiment logs |

## API Reference

### Backend (port 8000)
- `POST /traffic-data` — Ingest traffic sensor data
- `GET /traffic-status/{location_id}` — Latest prediction for a location
- `GET /traffic-heatmap` — Heatmap data `[[lat, lng, intensity], ...]`
- `GET /congestion-forecast/{location_id}` — Mock congestion prediction
- `POST /report-incident` — Report incident with optional signal override
- `WS /ws/traffic` — Real-time traffic updates

### ML Service (port 8001)
- `POST /predict` — Traffic level prediction
- `POST /debug-predict` — Verbose prediction with features and model info

## Project Structure

```
SJBIT/
├── backend/              # Backend FastAPI service
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic (ML client, decision, congestion)
│   └── db/               # MongoDB connection
├── ml-service/           # ML prediction service
│   ├── model/            # ML model files (upload .joblib here)
│   └── utils/            # Preprocessing utilities
├── frontend/             # Leaflet.js heatmap demo
├── simulate_traffic.py   # Traffic data simulator
└── docker-compose.yml    # Container orchestration
```

## Adding ML Model

Place your trained model at `ml-service/model/traffic_model.joblib` and restart the ML service. It will auto-detect and load the model.
