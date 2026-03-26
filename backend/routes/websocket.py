"""
WebSocket connection manager and broadcast route.
"""
import json
import logging
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        """Broadcast data to all connected clients."""
        disconnected = []
        message = json.dumps(data, default=str)
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        # Clean up stale connections
        for conn in disconnected:
            self.active_connections.remove(conn)


# Singleton manager
manager = ConnectionManager()


@router.websocket("/ws/traffic")
async def websocket_traffic(websocket: WebSocket):
    """WebSocket endpoint for real-time traffic updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for client messages (heartbeat)
            data = await websocket.receive_text()
            # Optional: handle client-side pings
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
