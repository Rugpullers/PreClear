import { useState } from 'react';
import { API_BASE } from '../../../config';

const SystemSettings = () => {
    const [refreshInterval, setRefreshInterval] = useState('5');
    const [mapProvider, setMapProvider] = useState('osm');
    const [logLevel, setLogLevel] = useState('info');
    const [cacheEnabled, setCacheEnabled] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <>
            <div className="sp-section">
                <h2 className="sp-section-title">🖥️ Data & Connection</h2>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>API Endpoint</span>
                        <span className="sp-field-hint">Backend server URL</span>
                    </div>
                    <input className="sp-input" type="text" value={API_BASE} readOnly style={{ opacity: 0.6 }} />
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Data Refresh Interval</span>
                        <span className="sp-field-hint">How often traffic data is fetched (in seconds)</span>
                    </div>
                    <select className="sp-select" value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)}>
                        <option value="2">2 seconds</option>
                        <option value="5">5 seconds</option>
                        <option value="10">10 seconds</option>
                        <option value="30">30 seconds</option>
                        <option value="60">60 seconds</option>
                    </select>
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Enable Caching</span>
                        <span className="sp-field-hint">Cache heatmap data locally to reduce API calls</span>
                    </div>
                    <label className="sp-toggle">
                        <input type="checkbox" checked={cacheEnabled} onChange={() => setCacheEnabled(!cacheEnabled)} />
                        <div className="sp-toggle-slider" />
                    </label>
                </div>
            </div>

            <div className="sp-section">
                <h2 className="sp-section-title">🗺️ Map Configuration</h2>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Map Tile Provider</span>
                        <span className="sp-field-hint">Choose the map rendering source</span>
                    </div>
                    <select className="sp-select" value={mapProvider} onChange={(e) => setMapProvider(e.target.value)}>
                        <option value="osm">OpenStreetMap</option>
                        <option value="carto-dark">Carto Dark Matter</option>
                        <option value="carto-light">Carto Positron</option>
                        <option value="stadia">Stadia Maps</option>
                    </select>
                </div>
            </div>

            <div className="sp-section">
                <h2 className="sp-section-title">🔧 Advanced</h2>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Log Level</span>
                        <span className="sp-field-hint">Controls browser console verbosity</span>
                    </div>
                    <select className="sp-select" value={logLevel} onChange={(e) => setLogLevel(e.target.value)}>
                        <option value="error">Error</option>
                        <option value="warn">Warn</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                    </select>
                </div>
            </div>

            <div className="sp-section">
                <h2 className="sp-section-title">⚠️ Danger Zone</h2>
                <div className="sp-danger-zone">
                    <div className="sp-field" style={{ borderBottom: 'none' }}>
                        <div className="sp-field-label">
                            <span>Clear Local Cache</span>
                            <span className="sp-field-hint">Remove all cached traffic data and preferences</span>
                        </div>
                        <button className="sp-danger-btn" onClick={() => {
                            localStorage.clear();
                            alert('Cache cleared!');
                        }}>
                            Clear Cache
                        </button>
                    </div>
                </div>
            </div>

            <button className="sp-save-btn" onClick={handleSave}>
                {saved ? '✓ Saved!' : 'Save System Settings'}
            </button>
        </>
    );
};

export default SystemSettings;
