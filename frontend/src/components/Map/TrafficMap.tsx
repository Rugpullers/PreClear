import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import './TrafficMap.css';

// Fix Leaflet default marker icons in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error Leaflet internals
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

/* ── Junction coordinates (matching backend routing graph) ── */
export const JUNCTIONS: Record<string, [number, number]> = {
    'Hebbal Flyover': [13.0354, 77.5988],
    'KR Puram Junction': [13.0076, 77.6833],
    'Whitefield Main Rd': [12.9698, 77.7499],
    'Marathahalli Bridge': [12.9569, 77.6983],
    'Outer Ring Road & Bellandur': [12.9304, 77.6784],
    'Sarjapur Junction': [12.9238, 77.6536],
    'Silk Board Junction': [12.9172, 77.6228],
    'Electronic City Flyover': [12.8452, 77.6601],
    'Bannerghatta Rd': [12.9064, 77.5996],
    'MG Road & Brigade Rd': [12.9749, 77.6081],
};

export const CONGESTION_COLORS: Record<string, string> = {
    LOW: '#22c55e',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444',
};

/* ── Route segment from API ─────────────────────────────── */
export interface RouteSegment {
    from: string;
    to: string;
    base_time_mins: number;
    from_lat: number;
    from_lng: number;
    to_lat: number;
    to_lng: number;
    predicted_time_mins: number;
    congestion_impact: string;
}

export interface RouteResult {
    source: string;
    destination: string;
    path: string[];
    total_estimated_time_mins: number;
    route_segments: RouteSegment[];
}

/* ── Heatmap point from API ─────────────────────────────── */
export interface HeatmapJunction {
    junction_id: string;
    total_vehicles: number;
    avg_vehicles: number;
    record_count: number;
}

/* ── Props ──────────────────────────────────────────────── */
interface TrafficMapProps {
    route?: RouteResult | null;
    heatmapData?: HeatmapJunction[];
    showJunctions?: boolean;
    height?: string;
}

const TrafficMap: React.FC<TrafficMapProps> = ({
    route,
    heatmapData,
    showJunctions = true,
    height = '100%',
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const junctionLayerRef = useRef<L.LayerGroup | null>(null);
    const routeControlRef = useRef<L.Routing.Control | null>(null);
    const heatLayerRef = useRef<L.LayerGroup | null>(null);

    /* ── Initialize map once ─────────────────────────────── */
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [12.9716, 77.5946],
            zoom: 12,
            zoomControl: true,
        });

        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            {
                attribution: '© OpenStreetMap © CARTO',
                maxZoom: 19,
            }
        ).addTo(map);

        mapRef.current = map;
        junctionLayerRef.current = L.layerGroup().addTo(map);
        heatLayerRef.current = L.layerGroup().addTo(map);

        // Invalidate size after mount (fixes grey tiles)
        setTimeout(() => map.invalidateSize(), 200);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    /* ── Draw junction markers ───────────────────────────── */
    useEffect(() => {
        if (!mapRef.current || !junctionLayerRef.current || !showJunctions) return;

        junctionLayerRef.current.clearLayers();

        Object.entries(JUNCTIONS).forEach(([name, [lat, lng]]) => {
            // Outer glow
            L.circleMarker([lat, lng], {
                radius: 18,
                fillColor: '#4eb8dd',
                color: '#4eb8dd',
                weight: 0,
                fillOpacity: 0.2,
            }).addTo(junctionLayerRef.current!);

            // Inner dot
            L.circleMarker([lat, lng], {
                radius: 7,
                fillColor: '#4eb8dd',
                color: '#fff',
                weight: 1.5,
                fillOpacity: 0.85,
            })
                .bindTooltip(name, {
                    className: 'junction-tooltip',
                    direction: 'top',
                    offset: [0, -10],
                })
                .addTo(junctionLayerRef.current!);
        });
    }, [showJunctions]);

    /* ── Draw route on map ───────────────────────────────── */
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Remove previous route
        if (routeControlRef.current) {
            map.removeControl(routeControlRef.current);
            routeControlRef.current = null;
        }

        if (!route || route.route_segments.length === 0) return;

        // Build waypoints from route segments
        const waypoints: L.LatLng[] = [];
        waypoints.push(
            L.latLng(
                route.route_segments[0].from_lat,
                route.route_segments[0].from_lng
            )
        );
        route.route_segments.forEach((seg) => {
            waypoints.push(L.latLng(seg.to_lat, seg.to_lng));
        });

        // Use leaflet-routing-machine for real-road paths
        const control = L.Routing.control({
            waypoints,
            lineOptions: {
                styles: [
                    {
                        color: '#00d4ff',
                        opacity: 0.85,
                        weight: 5,
                    },
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 100,
            },
            createMarker: () => null as unknown as L.Marker,
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            fitSelectedRoutes: true,
        } as L.Routing.RoutingControlOptions).addTo(map);

        routeControlRef.current = control;

        // Color the source & destination markers
        const srcCoords = JUNCTIONS[route.source];
        const dstCoords = JUNCTIONS[route.destination];

        if (srcCoords) {
            L.circleMarker(srcCoords, {
                radius: 12,
                fillColor: '#22c55e',
                color: '#fff',
                weight: 2,
                fillOpacity: 0.9,
            })
                .bindTooltip(`🟢 ${route.source}`, {
                    className: 'junction-tooltip',
                    permanent: true,
                    direction: 'top',
                    offset: [0, -14],
                })
                .addTo(junctionLayerRef.current!);
        }
        if (dstCoords) {
            L.circleMarker(dstCoords, {
                radius: 12,
                fillColor: '#ef4444',
                color: '#fff',
                weight: 2,
                fillOpacity: 0.9,
            })
                .bindTooltip(`🔴 ${route.destination}`, {
                    className: 'junction-tooltip',
                    permanent: true,
                    direction: 'top',
                    offset: [0, -14],
                })
                .addTo(junctionLayerRef.current!);
        }
    }, [route]);

    /* ── Draw heatmap data ───────────────────────────────── */
    useEffect(() => {
        if (!mapRef.current || !heatLayerRef.current) return;

        heatLayerRef.current.clearLayers();

        if (!heatmapData || heatmapData.length === 0) return;

        heatmapData.forEach((point) => {
            const coords = JUNCTIONS[point.junction_id];
            if (!coords) return;

            const avg = point.avg_vehicles;
            let color = CONGESTION_COLORS.LOW;
            if (avg > 400) color = CONGESTION_COLORS.HIGH;
            else if (avg > 200) color = CONGESTION_COLORS.MEDIUM;

            // Outer glow
            L.circleMarker(coords, {
                radius: 30,
                fillColor: color,
                color: color,
                weight: 0,
                fillOpacity: 0.3,
            }).addTo(heatLayerRef.current!);

            // Inner dot
            L.circleMarker(coords, {
                radius: 10,
                fillColor: color,
                color: '#fff',
                weight: 2,
                fillOpacity: 0.9,
            })
                .bindTooltip(
                    `<strong>${point.junction_id}</strong><br/>` +
                        `Avg: ${Math.round(point.avg_vehicles)} vehicles<br/>` +
                        `Records: ${point.record_count}`,
                    {
                        className: 'junction-tooltip',
                        direction: 'top',
                        offset: [0, -12],
                    }
                )
                .addTo(heatLayerRef.current!);
        });
    }, [heatmapData]);

    return (
        <div className="traffic-map-wrapper" style={{ height }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default TrafficMap;
