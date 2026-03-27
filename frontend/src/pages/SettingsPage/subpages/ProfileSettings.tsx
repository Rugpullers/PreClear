import { useState } from 'react';

const ProfileSettings = () => {
    const [name, setName] = useState('Admin');
    const [email, setEmail] = useState('admin@preclear.io');
    const [role, setRole] = useState('Traffic Operator');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <>
            <div className="sp-section">
                <h2 className="sp-section-title">👤 Profile Information</h2>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Display Name</span>
                        <span className="sp-field-hint">Shown across the PreClear dashboard</span>
                    </div>
                    <input
                        className="sp-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Email Address</span>
                        <span className="sp-field-hint">Used for account notifications</span>
                    </div>
                    <input
                        className="sp-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                    />
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Role</span>
                        <span className="sp-field-hint">Your assigned traffic management role</span>
                    </div>
                    <select
                        className="sp-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="Traffic Operator">Traffic Operator</option>
                        <option value="System Admin">System Admin</option>
                        <option value="Emergency Services">Emergency Services</option>
                        <option value="City Planner">City Planner</option>
                        <option value="Viewer">Viewer (Read Only)</option>
                    </select>
                </div>
            </div>

            <div className="sp-section">
                <h2 className="sp-section-title">🔐 Security</h2>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Change Password</span>
                        <span className="sp-field-hint">Must be at least 8 characters</span>
                    </div>
                    <input
                        className="sp-input"
                        type="password"
                        placeholder="••••••••"
                    />
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Two-Factor Authentication</span>
                        <span className="sp-field-hint">Add an extra layer of security</span>
                    </div>
                    <label className="sp-toggle">
                        <input type="checkbox" />
                        <div className="sp-toggle-slider" />
                    </label>
                </div>
            </div>

            <button className="sp-save-btn" onClick={handleSave}>
                {saved ? '✓ Saved!' : 'Save Profile'}
            </button>
        </>
    );
};

export default ProfileSettings;
