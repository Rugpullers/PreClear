import React from "react";

interface Props {
    isOpen: boolean;
    closeSidebar: () => void;
    onDashboardClick: () => void;
    onRoutePlannerClick: () => void;
    onTrafficDataClick: () => void;
    onAboutClick: () => void;
    onSettingsClick: () => void;
}

const Sidebar: React.FC<Props> = ({ isOpen, closeSidebar, onDashboardClick, onRoutePlannerClick, onTrafficDataClick, onAboutClick, onSettingsClick }) => {
    return (
        <>
            {/* Overlay — click to close sidebar */}
            <div
                className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
                onClick={closeSidebar}
            />

            {/* Sidebar panel */}
            <aside className={`sidebar ${isOpen ? "open" : ""}`}>
                <ul>
                    <li onClick={onDashboardClick}>Dashboard</li>
                    <li onClick={onTrafficDataClick}>Traffic Data</li>
                    <li onClick={onRoutePlannerClick}>Route Planner</li>
                    <li onClick={onAboutClick}>About</li>
                    <li onClick={onSettingsClick}>Settings</li>
                </ul>
            </aside>
        </>
    );
};

export default Sidebar;

