"""
Backend Service — FastAPI Application Entry Point

Intelligent Traffic Management System
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.db.connection import connect_db, close_db
from backend.routes import traffic, incidents, websocket, routing

# ── Logging ──────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── App Lifespan ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("Starting Backend Service...")
    await connect_db()
    yield
    await close_db()
    logger.info("Backend Service shut down.")


# ── FastAPI App ──────────────────────────────────────────────

app = FastAPI(
    title="Intelligent Traffic Management System — Backend",
    description="Real-time traffic data ingestion, ML prediction, decision logic, and WebSocket streaming.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ────────────────────────────────────────

app.include_router(traffic.router, tags=["Traffic"])
app.include_router(incidents.router, tags=["Incidents"])
app.include_router(websocket.router, tags=["WebSocket"])
app.include_router(routing.router, tags=["Routing"])


# ── Health Check ─────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "backend"}


@app.get("/")
async def root():
    return {
        "service": "Intelligent Traffic Management System — Backend",
        "version": "1.0.0",
        "endpoints": [
            "POST /traffic-data",
            "GET  /traffic-status/{location_id}",
            "GET  /traffic-heatmap",
            "GET  /congestion-forecast/{location_id}",
            "POST /report-incident",
            "WS   /ws/traffic",
            "GET  /health",
        ],
    }
