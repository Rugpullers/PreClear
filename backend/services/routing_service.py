"""
Routing Service — A* optimal path with real-time congestion penalties.

Uses a NetworkX graph of Bangalore's road network with junction coordinates.
Edge weights are dynamically adjusted based on predicted congestion levels
stored in MongoDB.
"""

import math
import logging
import networkx as nx
from typing import List, Dict, Any

from db.mongo import get_database

logger = logging.getLogger(__name__)

# ── 1. Define the Bangalore Road Network Graph ────────────────

ROUTING_GRAPH = nx.Graph()

# Node Data: Major junctions with approximate coordinates (Lat, Lng)
JUNCTIONS = {
    "Hebbal Flyover": (13.0354, 77.5988),
    "KR Puram Junction": (13.0076, 77.6833),
    "Whitefield Main Rd": (12.9698, 77.7499),
    "Marathahalli Bridge": (12.9569, 77.6983),
    "Outer Ring Road & Bellandur": (12.9304, 77.6784),
    "Sarjapur Junction": (12.9238, 77.6536),
    "Silk Board Junction": (12.9172, 77.6228),
    "Electronic City Flyover": (12.8452, 77.6601),
    "Bannerghatta Rd": (12.9064, 77.5996),
    "MG Road & Brigade Rd": (12.9749, 77.6081),
}

for name, coords in JUNCTIONS.items():
    ROUTING_GRAPH.add_node(name, lat=coords[0], lng=coords[1])

# Edge Data: Connected junctions with base travel time in minutes (off-peak)
EDGES = [
    ("Hebbal Flyover", "MG Road & Brigade Rd", 25),
    ("Hebbal Flyover", "KR Puram Junction", 20),
    ("KR Puram Junction", "MG Road & Brigade Rd", 30),
    ("KR Puram Junction", "Marathahalli Bridge", 15),
    ("KR Puram Junction", "Whitefield Main Rd", 20),
    ("Whitefield Main Rd", "Marathahalli Bridge", 15),
    ("Marathahalli Bridge", "Outer Ring Road & Bellandur", 10),
    ("Outer Ring Road & Bellandur", "Sarjapur Junction", 10),
    ("Sarjapur Junction", "Silk Board Junction", 15),
    ("Sarjapur Junction", "Electronic City Flyover", 20),
    ("Silk Board Junction", "MG Road & Brigade Rd", 20),
    ("Silk Board Junction", "Bannerghatta Rd", 15),
    ("Silk Board Junction", "Electronic City Flyover", 25),
    ("Bannerghatta Rd", "MG Road & Brigade Rd", 20),
]

for node1, node2, base_time in EDGES:
    ROUTING_GRAPH.add_edge(node1, node2, base_weight=base_time)


# ── 2. Helper Functions ──────────────────────────────────────

def haversine(node_a: str, node_b: str) -> float:
    """
    Haversine distance heuristic for A* algorithm.
    Returns approximate straight-line distance in km.
    """
    lat1, lon1 = ROUTING_GRAPH.nodes[node_a]['lat'], ROUTING_GRAPH.nodes[node_a]['lng']
    lat2, lon2 = ROUTING_GRAPH.nodes[node_b]['lat'], ROUTING_GRAPH.nodes[node_b]['lng']

    R = 6371  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_available_junctions() -> List[str]:
    """Return the list of available junction names for the routing graph."""
    return list(ROUTING_GRAPH.nodes)


# ── 3. Routing Logic ─────────────────────────────────────────

# Weight multipliers based on predicted traffic levels
PENALTY_MULTIPLIER = {
    "LOW": 1.0,
    "MEDIUM": 1.5,
    "HIGH": 3.0,
}


async def get_optimal_route(source: str, destination: str) -> Dict[str, Any]:
    """
    Calculates the fastest route using A* based on ML prediction integration.
    Fetches latest predicted congestion from MongoDB to penalize edge weights.
    """
    if source not in ROUTING_GRAPH:
        raise ValueError(
            f"Invalid source node: '{source}'. "
            f"Available nodes: {get_available_junctions()}"
        )
    if destination not in ROUTING_GRAPH:
        raise ValueError(
            f"Invalid destination node: '{destination}'. "
            f"Available nodes: {get_available_junctions()}"
        )

    db = get_database()

    # 1. Fetch latest predicted traffic states from MongoDB
    traffic_penalties = {}

    if db is not None:
        predictions_col = db["predictions"]
        for node in ROUTING_GRAPH.nodes:
            doc = await predictions_col.find_one(
                {"location_id": node},
                sort=[("timestamp", -1)]
            )
            level = doc.get("traffic_level", "LOW") if doc else "LOW"
            traffic_penalties[node] = PENALTY_MULTIPLIER.get(level.upper(), 1.0)
    else:
        # Fallback: no DB, assume LOW everywhere
        logger.warning("No database connection — using default LOW penalties.")
        for node in ROUTING_GRAPH.nodes:
            traffic_penalties[node] = 1.0

    # 2. Update graph edge weights dynamically
    G = ROUTING_GRAPH.copy()
    for u, v, data in G.edges(data=True):
        penalty = max(traffic_penalties[u], traffic_penalties[v])
        G[u][v]['current_time_weight'] = data['base_weight'] * penalty

    # 3. Calculate shortest path using A*
    try:
        path = nx.astar_path(
            G, source, destination,
            heuristic=haversine, weight='current_time_weight'
        )

        # Calculate expected total time based on penalized weights
        total_time = 0.0
        route_details = []
        for i in range(len(path) - 1):
            u = path[i]
            v = path[i + 1]
            segment_time = G[u][v]['current_time_weight']
            total_time += segment_time

            max_penalty = max(traffic_penalties[u], traffic_penalties[v])
            if max_penalty == 3.0:
                impact = "HIGH"
            elif max_penalty == 1.5:
                impact = "MEDIUM"
            else:
                impact = "LOW"

            route_details.append({
                "from": u,
                "to": v,
                "base_time_mins": G[u][v]['base_weight'],
                "from_lat": G.nodes[u]['lat'],
                "from_lng": G.nodes[u]['lng'],
                "to_lat": G.nodes[v]['lat'],
                "to_lng": G.nodes[v]['lng'],
                "predicted_time_mins": float(f"{segment_time:.1f}"),
                "congestion_impact": impact,
            })

        return {
            "source": source,
            "destination": destination,
            "path": path,
            "total_estimated_time_mins": round(total_time, 1),
            "route_segments": route_details,
        }
    except nx.NetworkXNoPath:
        raise ValueError("No path exists between the specified nodes.")
