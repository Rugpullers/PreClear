import { useState, useEffect, useCallback } from 'react';
import Clouds from '../../components/Clouds';
import TrafficMap, { RouteResult, HeatmapJunction } from '../../components/Map/TrafficMap';
import './RoutePlanner.css';

import { API_BASE } from '../../config';


const IMPACT_COLORS: Record<string, string> = {
    LOW: '#22c55e',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444',
};

const RoutePlanner = () => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [junctions, setJunctions] = useState<string[]>([]);
    const [result, setResult] = useState<RouteResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [heatmapData, setHeatmapData] = useState<HeatmapJunction[]>([]);

    // Fetch live heatmap data
    const fetchHeatmap = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/traffic-heatmap`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setHeatmapData(data.data);
            }
        } catch {
            // silently ignore — map will show default markers
        }
    }, []);

    // Auto-refresh heatmap every 5 seconds
    useEffect(() => {
        fetchHeatmap();
        const interval = setInterval(fetchHeatmap, 5000);
        return () => clearInterval(interval);
    }, [fetchHeatmap]);

    useEffect(() => {
        fetch(`${API_BASE}/junctions`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success) setJunctions(data.data);
            })
            .catch(() => setError('Could not load junctions. Is the backend running?'));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!source || !destination) return;
        if (source === destination) {
            setError('Source and destination must be different.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch(
                `${API_BASE}/optimal-route?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`
            );
            const data = await res.json();
            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.detail || 'Route calculation failed.');
            }
        } catch {
            setError('Could not reach the backend. Make sure Docker is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleAmbulance = () => {
        alert('🚑 Ambulance priority mode — Your route has been sent to the traffic signal monitoring authorities, to aid your journey');
    };

    return (
        <div className="rp-page">
            <Clouds />

            <div className="rp-layout">
                {/* ── Left: Form Card (glassmorphism) ───────── */}
                <div className="rp-panel">
                    <div className="glass-card">
                        <div className="route-planner-header">
                            <h2 className="route-planner-title">Route Planner</h2>
                            <button type="button" className="ambulance-btn" onClick={handleAmbulance}>
                                🚑 Ambulance
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="route-planner-form">
                            <div className="rp-input-group">
                                <label htmlFor="rp-source">Source</label>
                                <select
                                    id="rp-source"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    className="rp-select"
                                >
                                    <option value="">— Select source —</option>
                                    {junctions.map((j) => (
                                        <option key={j} value={j}>{j}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="rp-input-group">
                                <label htmlFor="rp-destination">Destination</label>
                                <select
                                    id="rp-destination"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="rp-select"
                                >
                                    <option value="">— Select destination —</option>
                                    {junctions.filter((j) => j !== source).map((j) => (
                                        <option key={j} value={j}>{j}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="rp-submit-btn"
                                disabled={loading || !source || !destination}
                            >
                                {loading ? 'Calculating...' : '🔍 Find Optimal Route'}
                            </button>
                        </form>

                        {error && <div className="rp-error">{error}</div>}

                        {/* ── Route Results ─────────────────── */}
                        {result && (
                            <div className="rp-results">
                                <div className="rp-summary">
                                    <div className="rp-summary-item">
                                        <span className="rp-summary-label">Total ETA</span>
                                        <span className="rp-summary-value">
                                            {result.total_estimated_time_mins} min
                                        </span>
                                    </div>
                                    <div className="rp-summary-item">
                                        <span className="rp-summary-label">Stops</span>
                                        <span className="rp-summary-value">{result.path.length}</span>
                                    </div>
                                </div>

                                <div className="rp-path">
                                    {result.path.map((node, i) => (
                                        <div key={node} className="rp-path-node">
                                            <div
                                                className="rp-path-dot"
                                                style={{
                                                    background:
                                                        i === 0
                                                            ? '#22c55e'
                                                            : i === result.path.length - 1
                                                                ? '#ef4444'
                                                                : '#4eb8dd',
                                                }}
                                            />
                                            <span className="rp-path-name">{node}</span>
                                            {i < result.route_segments.length && (
                                                <div
                                                    className="rp-path-line"
                                                    style={{
                                                        borderColor:
                                                            IMPACT_COLORS[
                                                            result.route_segments[i].congestion_impact
                                                            ] || '#666',
                                                    }}
                                                >
                                                    <span className="rp-segment-time">
                                                        {result.route_segments[i].predicted_time_mins} min
                                                    </span>
                                                    <span
                                                        className="rp-segment-badge"
                                                        style={{
                                                            background:
                                                                IMPACT_COLORS[
                                                                result.route_segments[i].congestion_impact
                                                                ] || '#666',
                                                        }}
                                                    >
                                                        {result.route_segments[i].congestion_impact}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Map (glassmorphism wrapper) ───── */}
                <div className="rp-map-panel">
                    <div className="glass-card glass-card--map">
                        <TrafficMap route={result} heatmapData={heatmapData} showJunctions={heatmapData.length === 0} height="100%" />
                        {/* Legend */}
                        <div className="map-legend">
                            <div className="map-legend-item">
                                <div className="map-legend-dot" style={{ background: '#22c55e' }} /> LOW
                            </div>
                            <div className="map-legend-item">
                                <div className="map-legend-dot" style={{ background: '#f59e0b' }} /> MEDIUM
                            </div>
                            <div className="map-legend-item">
                                <div className="map-legend-dot" style={{ background: '#ef4444' }} /> HIGH
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoutePlanner;
