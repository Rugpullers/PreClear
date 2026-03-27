import { useState } from 'react';

const NotificationSettings = () => {
    const [congestionAlerts, setCongestionAlerts] = useState(true);
    const [ambulanceAlerts, setAmbulanceAlerts] = useState(true);
    const [systemStatus, setSystemStatus] = useState(false);
    const [dailyDigest, setDailyDigest] = useState(true);
    const [soundEffects, setSoundEffects] = useState(true);
    const [alertThreshold, setAlertThreshold] = useState('HIGH');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <>
            <div className="sp-section">
                <h2 className="sp-section-title">🔔 Alert Preferences</h2>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Congestion Alerts</span>
                        <span className="sp-field-hint">Notify when a junction reaches alert threshold</span>
                    </div>
                    <label className="sp-toggle">
                        <input type="checkbox" checked={congestionAlerts} onChange={() => setCongestionAlerts(!congestionAlerts)} />
                        <div className="sp-toggle-slider" />
                    </label>
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Ambulance Priority Alerts</span>
                        <span className="sp-field-hint">Get notified when emergency routes are activated</span>
                    </div>
                    <label className="sp-toggle">
                        <input type="checkbox" checked={ambulanceAlerts} onChange={() => setAmbulanceAlerts(!ambulanceAlerts)} />
                        <div className="sp-toggle-slider" />
                    </label>
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>System Status Updates</span>
                        <span className="sp-field-hint">Connection status, API health, model refresh</span>
                    </div>
                    <label className="sp-toggle">
                        <input type="checkbox" checked={systemStatus} onChange={() => setSystemStatus(!systemStatus)} />
                        <div className="sp-toggle-slider" />
                    </label>
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Alert Threshold</span>
                        <span className="sp-field-hint">Minimum congestion level that triggers alerts</span>
                    </div>
                    <select className="sp-select" value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)}>
                        <option value="LOW">Low (all alerts)</option>
                        <option value="MEDIUM">Medium & above</option>
                        <option value="HIGH">High only</option>
                    </select>
                </div>
            </div>

            <div className="sp-section">
                <h2 className="sp-section-title">📬 Digest & Sounds</h2>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Daily Traffic Digest</span>
                        <span className="sp-field-hint">Receive a summary email every morning</span>
                    </div>
                    <label className="sp-toggle">
                        <input type="checkbox" checked={dailyDigest} onChange={() => setDailyDigest(!dailyDigest)} />
                        <div className="sp-toggle-slider" />
                    </label>
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Sound Effects</span>
                        <span className="sp-field-hint">Play sound when critical alerts arrive</span>
                    </div>
                    <label className="sp-toggle">
                        <input type="checkbox" checked={soundEffects} onChange={() => setSoundEffects(!soundEffects)} />
                        <div className="sp-toggle-slider" />
                    </label>
                </div>
            </div>

            <button className="sp-save-btn" onClick={handleSave}>
                {saved ? '✓ Saved!' : 'Save Preferences'}
            </button>
        </>
    );
};

export default NotificationSettings;
