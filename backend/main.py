from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes import traffic, predict, health, routing
from db.mongo import connect_to_mongo, close_mongo_connection
from services.data_feeder import start_feeder, stop_feeder, get_feeder_status
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Starting up application...")
    await connect_to_mongo()
    # Start data feeder after a short delay to let ML service boot
    asyncio.create_task(_delayed_feeder_start())
    yield
    # Shutdown actions
    logger.info("Shutting down application...")
    await stop_feeder()
    await close_mongo_connection()

async def _delayed_feeder_start():
    await asyncio.sleep(5)
    await start_feeder()

app = FastAPI(
    title="Intelligent Traffic Management System",
    description="Backend API for managing traffic data and routing ML predictions",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, tags=["Health Check"])
app.include_router(traffic.router, tags=["Traffic"])
app.include_router(predict.router, tags=["ML Prediction"])
app.include_router(routing.router, tags=["Routing"])

# ── Feeder control endpoints ──────────────────────────────
@app.get("/feeder/status", tags=["Data Feeder"])
async def feeder_status():
    return get_feeder_status()

@app.post("/feeder/start", tags=["Data Feeder"])
async def feeder_start():
    await start_feeder()
    return {"message": "Feeder started"}

@app.post("/feeder/stop", tags=["Data Feeder"])
async def feeder_stop():
    await stop_feeder()
    return {"message": "Feeder stopped"}
