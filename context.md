# 🚦 PreClear AI — Intelligent Traffic & Emergency Management System

## 🧠 Executive Summary

PreClear AI is a next-generation smart traffic management platform designed to **predict urban congestion** and **automate emergency vehicle priority**. By leveraging real-time simulations and machine learning, it transforms reactive traffic signals into a proactive, coordinated "Green Corridor" network.

### 🎯 The Problem
- **Urban Gridlock**: Commutes in major cities (Bangalore, Mumbai) are plagued by non-predictive signaling.
- **Emergency Delays**: Ambulances are frequently stuck, losing critical "Golden Hour" time.
- **Fragmented Control**: Lack of communication between adjacent traffic junctions results in ripple-effect bottlenecks.

### 💡 The Solution
- **Predictive Intelligence**: Random Forest ML models forecast congestion before it happens.
- **Automated Green Corridors**: One-click emergency overrides that clear paths dynamically.
- **Synchronized Junctions**: Multi-junction timing optimization to maintain steady traffic flow.

---

## 🏗️ Technical Architecture & Data Flow

### 📊 Data Pipeline
1. **Simulation**: `simulate_traffic.py` generates high-fidelity traffic telemetry (count, speed, weather).
2. **Ingestion Layer**: FastAPI Backend processes data via REST and WebSockets.
3. **Intelligence Layer**: ML Service analyzes 7-factor feature vectors to predict congestion.
4. **Decision Engine**: Calculates optimal signal timing (60s base cycle with dynamic allocation).
5. **Storage**: MongoDB Dual-Database approach (Telemetric historical data + System state).
6. **Presentation**: React/Leaflet frontend provides real-time heatmaps and interactive overrides.

---

## ⚙️ Subsystem Specifications

### 🤖 Machine Learning Service
- **Model**: Random Forest Classifier (n=100).
- **Inputs (7 Features)**:
  1. `vehicle_count`: Real-time density.
  2. `avg_speed`: Flow velocity.
  3. `time_of_day`: Peak vs Off-peak hour encoding.
  4. `day_of_week`: Weekend vs Weekday patterns.
  5. `weather_impact`: Weight (0.0 - 1.0) based on precipitation level.
  6. `event_flag`: Nearby public events (stadiums, rallies).
  7. `emergency_flag`: Priority vehicle status.
- **Output**: Congestion levels (🟢 Smooth, 🟠 Moderate, 🔴 Heavy).

### ⚡ Backend API (FastAPI)
- **Key Endpoints**:
  - `GET /api/v1/traffic/status/{junction_id}`: Real-time junction state.
  - `POST /api/v1/incidents/report`: User-reported accidents/roadworks.
  - `GET /api/v1/traffic/heatmap`: Aggregated density for Leaflet rendering.
  - `WS /ws/live-feed`: Bi-directional socket for instant UI updates.
- **Decision Logic**:
  - **Congestion 2 (Heavy)**: Green phase +40% extension.
  - **Emergency Trigger**: Forced GREEN on route; cross-traffic forced RED until vehicle clears buffer zone.

### 🌐 Frontend & Landing Experience
- **Hero Animation**: Vanta.js "Clouds" background with high-impact typography.
- **Scroll-Driven Zoom**: 
  - 150+ WebP frames (Veo3 generated) mapped to scroll progress.
  - Smooth interpolation using GSAP ScrollTrigger.
- **Map Interaction**:
  - **Leaflet.heat**: Real-time clustering of traffic density.
  - **Active Overlays**: SVG-based junction markers with dynamic color-state toggling.
  - **Polylines**: Blue animated routes for emergency vehicles.

---

## 📁 Project Structure (Definitive)

```text
PreClear/
├── backend/                          # Backend logic (FastAPI)
│   ├── main.py                       # App entry point & Router initialization
│   ├── routes/                       # traffic.py, incidents.py, websocket.py
│   ├── services/                     # decision.py, ml_client.py, congestion.py
│   ├── db/                           # connection.py (Motor/MongoDB)
│   ├── Dockerfile
│   └── requirements.txt
├── ml-service/                       # Intelligence Service
│   ├── main.py                       # Prediction API
│   ├── model/                        # train_model.py, traffic_model.joblib
│   ├── utils/                        # preprocessing.py (Normalization/Encoding)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                         # Presentation Layer
│   ├── index.html                    # Landing page (Vanta + GSAP)
│   ├── heatmap.html                  # Interactive Map (Leaflet)
│   └── assets/                       # Image frames, CSS, Icons
├── simulate_traffic.py               # Root-level Telemetry Generator
├── docker-compose.yml                # Full-stack orchestration
├── .gitignore                        # Environment & Cache exclusion
└── README.md                         # Setup & Demo Guide
```

---

## ⚡ Winning Factors & Demo Flow
1. **The Hook**: Landing animation zooms from "Sky to Street".
2. **The Reveal**: Seamless morph from animation to a Live Map of Bangalore.
3. **The Proof**: Trigger an ambulance; watch the heatmap clear and signals turn green.
4. **The Impact**: Show "Predicted vs Actual" to highlight the ML advantage.

> 🏆 **Final Pitch**: “PreClear AI doesn’t just observe traffic—it predicts it and proactively saves lives by clearing the path for those who need it most.”
