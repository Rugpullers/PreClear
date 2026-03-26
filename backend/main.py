from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes import traffic, predict, health
from db.mongo import connect_to_mongo, close_mongo_connection
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Starting up application...")
    await connect_to_mongo()
    yield
    # Shutdown actions
    logger.info("Shutting down application...")
    await close_mongo_connection()

app = FastAPI(
    title="Intelligent Traffic Management System",
    description="Backend API for managing traffic data and routing ML predictions",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:3000",
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
