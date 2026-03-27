import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Clouds from '../../components/Clouds';
import ProfileSettings from './subpages/ProfileSettings';
import NotificationSettings from './subpages/NotificationSettings';
import SystemSettings from './subpages/SystemSettings';
import AppearanceSettings from './subpages/AppearanceSettings';
import './SettingsPage.css';

type SettingsTab = 'profile' | 'notifications' | 'system' | 'appearance';

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'system', label: 'System', icon: '🖥️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
];

const SettingsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    const renderSubpage = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'notifications': return <NotificationSettings />;
            case 'system': return <SystemSettings />;
            case 'appearance': return <AppearanceSettings />;
        }
    };

    return (
        <div className="settings-page">
            <Clouds />

            <div className="settings-layout">
                {/* Header */}
                <div className="settings-header">
                    <div className="settings-header-left">
                        <h1 className="settings-title">Settings</h1>
                        <span className="settings-subtitle">Manage your PreClear preferences</span>
                    </div>
                    <button className="settings-back-btn" onClick={() => navigate('/home')}>
                        ← Back to Home
                    </button>
                </div>

                <div className="settings-body">
                    {/* Sidebar tabs */}
                    <nav className="settings-nav">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={`settings-nav-btn ${activeTab === tab.id ? 'settings-nav-btn--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="settings-nav-icon">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Content area */}
                    <div className="settings-content" key={activeTab}>
                        {renderSubpage()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
