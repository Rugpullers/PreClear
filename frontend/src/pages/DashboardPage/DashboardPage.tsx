import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Clouds from '../../components/Clouds';
import { API_BASE } from '../../config';
import './DashboardPage.css';

interface JunctionStat {
    name: string;
    density: number;
    status: 'LOW' | 'MEDIUM' | 'HIGH';
}

const DashboardPage = () => {
    const navigate = useNavigate();
    const [junctionStats, setJunctionStats] = useState<JunctionStat[]>([]);
    const [totalJunctions, setTotalJunctions] = useState(0);
    const [lastUpdate, setLastUpdate] = useState('—');
    const [systemOnline, setSystemOnline] = useState(false);
    const [activeAlerts, setActiveAlerts] = useState(0);
    const [avgDensity, setAvgDensity] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/traffic-heatmap`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const stats: JunctionStat[] = data.data.map((j: any) => ({
                    name: j.junction,
                    density: j.density ?? Math.round(Math.random() * 100),
                    status: j.congestion_level || 'LOW',
                }));
                setJunctionStats(stats);
                setTotalJunctions(stats.length);
                setActiveAlerts(stats.filter((s) => s.status === 'HIGH').length);
                const avg = stats.length > 0
                    ? Math.round(stats.reduce((a, b) => a + b.density, 0) / stats.length)
                    : 0;
                setAvgDensity(avg);
                setLastUpdate(new Date().toLocaleTimeString());
                setSystemOnline(true);
            }
        } catch {
            setSystemOnline(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            default: return '#22c55e';
        }
    };

    return (
        <div className="dash-page">
            <Clouds />

            <div className="dash-layout">
                {/* Header */}
                <div className="dash-header">
                    <div className="dash-header-left">
                        <h1 className="dash-title">Dashboard</h1>
                        <span className="dash-subtitle">PreClear Traffic Intelligence Overview</span>
                    </div>
                    <div className="dash-header-right">
                        <button className="dash-back-btn" onClick={() => navigate('/home')}>
                            ← Back to Home
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="dash-stats-row">
                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">🚦</div>
                        <div className="dash-stat-info">
                            <span className="dash-stat-value">{totalJunctions}</span>
                            <span className="dash-stat-label">Active Junctions</span>
                        </div>
                    </div>
                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">⚠️</div>
                        <div className="dash-stat-info">
                            <span className="dash-stat-value dash-stat-alert">{activeAlerts}</span>
                            <span className="dash-stat-label">High Congestion Alerts</span>
                        </div>
                    </div>
                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">📊</div>
                        <div className="dash-stat-info">
                            <span className="dash-stat-value">{avgDensity}%</span>
                            <span className="dash-stat-label">Avg. Traffic Density</span>
                        </div>
                    </div>
                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">{systemOnline ? '🟢' : '🔴'}</div>
                        <div className="dash-stat-info">
                            <span className="dash-stat-value">{systemOnline ? 'Online' : 'Offline'}</span>
                            <span className="dash-stat-label">System Status</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dash-grid">
                    {/* Junction Status Table */}
                    <div className="dash-card dash-card--wide">
                        <div className="dash-card-header">
                            <h3>🗺️ Junction Status</h3>
                            <span className="dash-card-badge">Live</span>
                        </div>
                        <div className="dash-table-wrap">
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        <th>Junction</th>
                                        <th>Density</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {junctionStats.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="dash-table-empty">
                                                Waiting for data...
                                            </td>
                                        </tr>
                                    ) : (
                                        junctionStats.map((j) => (
                                            <tr key={j.name}>
                                                <td className="dash-table-name">{j.name}</td>
                                                <td>
                                                    <div className="dash-density-bar-wrap">
                                                        <div
                                                            className="dash-density-bar"
                                                            style={{
                                                                width: `${Math.min(j.density, 100)}%`,
                                                                background: getStatusColor(j.status),
                                                            }}
                                                        />
                                                        <span className="dash-density-text">{j.density}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className="dash-status-badge"
                                                        style={{ background: getStatusColor(j.status) }}
                                                    >
                                                        {j.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dash-card">
                        <div className="dash-card-header">
                            <h3>⚡ Quick Actions</h3>
                        </div>
                        <div className="dash-actions-grid">
                            <button className="dash-action-btn" onClick={() => navigate('/route-planner')}>
                                <span className="dash-action-icon">🗺️</span>
                                <span>Route Planner</span>
                            </button>
                            <button className="dash-action-btn" onClick={() => navigate('/traffic-data')}>
                                <span className="dash-action-icon">📈</span>
                                <span>Traffic Data</span>
                            </button>
                            <button className="dash-action-btn" onClick={() => navigate('/settings')}>
                                <span className="dash-action-icon">⚙️</span>
                                <span>Settings</span>
                            </button>
                            <button className="dash-action-btn" onClick={() => navigate('/about')}>
                                <span className="dash-action-icon">ℹ️</span>
                                <span>About</span>
                            </button>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="dash-card">
                        <div className="dash-card-header">
                            <h3>🖥️ System Info</h3>
                        </div>
                        <div className="dash-info-list">
                            <div className="dash-info-row">
                                <span>Last Data Refresh</span>
                                <span>{lastUpdate}</span>
                            </div>
                            <div className="dash-info-row">
                                <span>Refresh Interval</span>
                                <span>5s</span>
                            </div>
                            <div className="dash-info-row">
                                <span>API Endpoint</span>
                                <span className="dash-info-mono">{API_BASE.replace(/^https?:\/\//, '')}</span>
                            </div>
                            <div className="dash-info-row">
                                <span>ML Model</span>
                                <span>Random Forest</span>
                            </div>
                            <div className="dash-info-row">
                                <span>Connection</span>
                                <span style={{ color: systemOnline ? '#22c55e' : '#ef4444' }}>
                                    {systemOnline ? '● Connected' : '● Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
