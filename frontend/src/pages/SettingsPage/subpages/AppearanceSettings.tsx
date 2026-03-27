import { useState } from 'react';

const ACCENT_COLORS = [
    { name: 'Cyan', value: '#4eb8dd' },
    { name: 'Emerald', value: '#22c55e' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Sky', value: '#0ea5e9' },
];

const AppearanceSettings = () => {
    const [theme, setTheme] = useState('dark');
    const [accentColor, setAccentColor] = useState('#4eb8dd');
    const [fontSize, setFontSize] = useState('medium');
    const [animations, setAnimations] = useState(true);
    const [cloudsBg, setCloudsBg] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <>
            <div className="sp-section">
                <h2 className="sp-section-title">🎨 Theme & Colors</h2>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Theme Mode</span>
                        <span className="sp-field-hint">Light mode coming soon</span>
                    </div>
                    <select className="sp-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                        <option value="dark">Dark (Default)</option>
                        <option value="light" disabled>Light (Coming Soon)</option>
                        <option value="auto" disabled>System (Coming Soon)</option>
                    </select>
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Accent Color</span>
                        <span className="sp-field-hint">Used for buttons, highlights, and active states</span>
                    </div>
                    <div className="sp-color-options">
                        {ACCENT_COLORS.map((c) => (
                            <div
                                key={c.value}
                                className={`sp-color-circle ${accentColor === c.value ? 'sp-color-circle--active' : ''}`}
                                style={{ background: c.value }}
                                onClick={() => setAccentColor(c.value)}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="sp-section">
                <h2 className="sp-section-title">📐 Layout & Display</h2>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Font Size</span>
                        <span className="sp-field-hint">Adjust text size across the interface</span>
                    </div>
                    <select className="sp-select" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                        <option value="small">Small</option>
                        <option value="medium">Medium (Default)</option>
                        <option value="large">Large</option>
                    </select>
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Animations</span>
                        <span className="sp-field-hint">Enable smooth transitions and micro-animations</span>
                    </div>
                    <label className="sp-toggle">
                        <input type="checkbox" checked={animations} onChange={() => setAnimations(!animations)} />
                        <div className="sp-toggle-slider" />
                    </label>
                </div>

                <div className="sp-field">
                    <div className="sp-field-label">
                        <span>Cloud Background</span>
                        <span className="sp-field-hint">Show animated clouds on page backgrounds</span>
                    </div>
                    <label className="sp-toggle">
                        <input type="checkbox" checked={cloudsBg} onChange={() => setCloudsBg(!cloudsBg)} />
                        <div className="sp-toggle-slider" />
                    </label>
                </div>
            </div>

            <button className="sp-save-btn" onClick={handleSave}>
                {saved ? '✓ Saved!' : 'Save Appearance'}
            </button>
        </>
    );
};

export default AppearanceSettings;
