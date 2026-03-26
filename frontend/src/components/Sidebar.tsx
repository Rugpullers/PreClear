import React from "react";

interface Props {
    isOpen: boolean;
    closeSidebar: () => void;
    onRoutePlannerClick: () => void;
    onAboutClick: () => void;
}

const Sidebar: React.FC<Props> = ({ isOpen, closeSidebar, onRoutePlannerClick, onAboutClick }) => {
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
                    <li onClick={closeSidebar}>Dashboard</li>
                    <li>Traffic Data</li>
                    <li onClick={onRoutePlannerClick}>Route Planner</li>
                    <li onClick={onAboutClick}>About</li>
                    <li>Settings</li>
                </ul>
            </aside>
        </>
    );
};

export default Sidebar;
