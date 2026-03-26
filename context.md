# Intelligent Traffic Management System — Context

## Product Vision

A hackathon-ready, real-time traffic management platform that ingests live traffic sensor data, leverages ML predictions via a dedicated microservice, and streams updates to connected clients. The system separates operational and ML concerns into independent databases and services, enabling scalable experimentation.

## Architecture

```
 ┌──────────────┐     POST /traffic-data      ┌──────────────────┐
 │  Simulator   │ ──────────────────────────▶  │  Backend :8000   │
 └──────────────┘                              │  (FastAPI)       │
                                               │                  │
                              REST /predict    │                  │
                           ┌──────────────────▶│  routes/         │
                           │                   │  services/       │
                           ▼                   │  db/             │
                  ┌──────────────────┐         └──────┬───────────┘
                  │  ML Service :8001│                 │
                  │  (FastAPI)       │                 │  WS /ws/traffic
                  │  model/          │                 │  GET /traffic-heatmap
                  │  utils/          │                 ▼
                  └────────┬─────────┘         ┌──────────────────┐
                           │                   │  Frontend /      │
                           │                   │  WebSocket       │
                           ▼                   │  Clients         │
                  ┌──────────────────┐         └──────────────────┘
                  │  MongoDB ML      │                 │
                  │  :27018          │                 ▼
                  │  (ml_logs)       │         ┌──────────────────┐
                  └──────────────────┘         │  MongoDB App     │
                                               │  :27017          │
                                               │  traffic_data    │
                                               │  predictions     │
                                               │  incidents       │
                                               └──────────────────┘
```

## Technology Stack

| Component    | Technology            | Port  |
|-------------|----------------------|-------|
| Backend     | FastAPI + Uvicorn    | 8000  |
| ML Service  | FastAPI + Uvicorn    | 8001  |
| MongoDB App | MongoDB 7            | 27017 |
| MongoDB ML  | MongoDB 7            | 27018 |
| Frontend    | Leaflet.js + leaflet-heat | — |
| Orchestration | Docker Compose     | —     |

## Key Design Decisions

1. **Two databases** — App DB holds operational data; ML DB holds experiment logs. Keeps ML iteration independent of production.
2. **REST between services** — Backend calls ML via HTTP. Simple, debuggable, no shared state.
3. **WebSocket fan-out** — Backend broadcasts every new prediction to all connected WS clients.
4. **Dummy ML model** — scikit-learn RandomForestClassifier trained on synthetic data. Good for demo; easily replaceable.
5. **Docker Compose** — Single `docker-compose up` brings up all 4 containers on a shared network.

## Database Schema

### mongodb_app (port 27017)

| Collection     | Key Fields                                                    |
|---------------|---------------------------------------------------------------|
| `traffic_data` | `location_id`, `vehicle_count`, `avg_speed`, `lat`, `lng`, `timestamp` |
| `predictions`  | `location_id`, `traffic_level`, `confidence`, `green_time`, `timestamp` |
| `incidents`    | `location_id`, `type`, `severity`, `description`, `override_signal`, `timestamp` |

### mongodb_ml (port 27018)

| Collection | Key Fields                                                         |
|-----------|---------------------------------------------------------------------|
| `ml_logs`  | `input`, `processed_features`, `prediction`, `model_version`, `timestamp` |

## API Reference

| Endpoint                    | Method | Service  | Purpose                            |
|----------------------------|--------|----------|------------------------------------|
| `/traffic-data`            | POST   | Backend  | Ingest sensor data → predict → broadcast |
| `/traffic-status/{id}`     | GET    | Backend  | Latest prediction for a location   |
| `/report-incident`         | POST   | Backend  | Log incident, override signal      |
| `/traffic-heatmap`         | GET    | Backend  | `[[lat, lng, intensity], ...]`     |
| `/ws/traffic`              | WS     | Backend  | Real-time prediction stream        |
| `/predict`                 | POST   | ML       | Returns traffic_level + confidence |
| `/debug-predict`           | POST   | ML       | Verbose prediction with features   |

## Advanced Features

- **Emergency vehicle override** — high-severity incidents force signal changes
- **Congestion prediction** — mock 5–10 min forecast
- **Explainable AI** — prediction includes a human-readable `reason` field
