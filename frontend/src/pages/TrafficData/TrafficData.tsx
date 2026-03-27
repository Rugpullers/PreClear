import { useState, useEffect, useCallback } from 'react';
import Clouds from '../../components/Clouds';
import TrafficMap, { HeatmapJunction } from '../../components/Map/TrafficMap';
import './TrafficData.css';

const API_BASE = 'http://localhost:8000';

const TrafficData = () => {
    const [heatmapData, setHeatmapData] = useState<HeatmapJunction[]>([]);
    const [lastUpdate, setLastUpdate] = useState<string>('—');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchHeatmap = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/traffic-heatmap`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setHeatmapData(data.data);
                setLastUpdate(new Date().toLocaleTimeString());
            }
        } catch (e) {
            console.error('Failed to fetch heatmap:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchHeatmap();
    }, [fetchHeatmap]);

    // Auto-refresh interval
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchHeatmap, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchHeatmap]);

    return (
        <div className="td-page">
            <Clouds />

            <div className="td-layout">
                {/* ── Controls bar (glassmorphism) ──────────── */}
                <div className="td-controls glass-bar">
                    <h2 className="td-title">🚦 Traffic Heatmap</h2>

                    <div className="td-actions">
                        <button
                            className={`td-btn ${loading ? 'td-btn--loading' : ''}`}
                            onClick={fetchHeatmap}
                            disabled={loading}
                        >
                            🔄 {loading ? 'Loading...' : 'Refresh'}
                        </button>
                        <button
                            className={`td-btn ${autoRefresh ? 'td-btn--active' : ''}`}
                            onClick={() => setAutoRefresh((v) => !v)}
                        >
                            ⏱ Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className="td-legend">
                        <div className="td-legend-item">
                            <span className="td-legend-dot" style={{ background: '#22c55e' }} /> LOW
                        </div>
                        <div className="td-legend-item">
                            <span className="td-legend-dot" style={{ background: '#f59e0b' }} /> MEDIUM
                        </div>
                        <div className="td-legend-item">
                            <span className="td-legend-dot" style={{ background: '#ef4444' }} /> HIGH
                        </div>
                    </div>
                </div>

                {/* ── Map (glassmorphism wrapper) ───────────── */}
                <div className="td-map-wrapper">
                    <div className="glass-card glass-card--map">
                        <TrafficMap
                            heatmapData={heatmapData}
                            showJunctions={heatmapData.length === 0}
                            height="100%"
                        />

                        {/* Info panel */}
                        <div className="td-info-panel">
                            <h4>📊 Traffic Summary</h4>
                            <div className="td-info-row">
                                <span>Junctions</span>
                                <span>{heatmapData.length}</span>
                            </div>
                            <div className="td-info-row">
                                <span>Last Updated</span>
                                <span>{lastUpdate}</span>
                            </div>
                            <div className="td-info-row">
                                <span>Auto-Refresh</span>
                                <span style={{ color: autoRefresh ? '#22c55e' : '#ef4444' }}>
                                    {autoRefresh ? 'Active' : 'Off'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrafficData;
