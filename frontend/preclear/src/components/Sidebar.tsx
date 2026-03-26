import React from "react";

interface Props {
    isOpen: boolean;
    closeSidebar: () => void;
    onRoutePlannerClick: () => void;
    onAboutClick: () => void;
}

const Sidebar: React.FC<Props> = ({ isOpen, closeSidebar, onRoutePlannerClick, onAboutClick }) => {
    const handleRoutePlannerClick = () => {
        closeSidebar();
        onRoutePlannerClick();
    };

    const handleAboutClick = () => {
        closeSidebar();
        onAboutClick();
    };

    return (
        <>
            {/* Overlay — click to close sidebar */}
            <div
                className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
                onClick={closeSidebar}
            />

            {/* Sidebar panel */}
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <ul>
                    <li>Dashboard</li>
                    <li>Traffic Data</li>
                    <li onClick={handleRoutePlannerClick}>Route Planner</li>
                    <li onClick={handleAboutClick}>About</li>
                    <li>Settings</li>
                </ul>
            </div>
        </>
    );
};

export default Sidebar;