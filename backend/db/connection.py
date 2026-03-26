"""
MongoDB connection module for the Backend service.
Connects to mongodb_app and provides collection accessors.
"""
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

MONGO_URL = os.getenv("MONGO_APP_URL", "mongodb://mongodb_app:27017")
DB_NAME = os.getenv("MONGO_APP_DB", "traffic_app")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Initialize MongoDB connection."""
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        # Verify connection
        await client.admin.command("ping")
        logger.info(f"Connected to MongoDB App at {MONGO_URL}/{DB_NAME}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB App: {e}")
        raise


async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        logger.info("MongoDB App connection closed")


def get_collection(name: str):
    """Get a collection from the app database."""
    if db is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return db[name]


# Convenience accessors
def traffic_data_collection():
    return get_collection("traffic_data")


def predictions_collection():
    return get_collection("predictions")


def incidents_collection():
    return get_collection("incidents")
