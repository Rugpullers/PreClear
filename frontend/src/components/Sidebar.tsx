import React from "react";

interface Props {
    isOpen: boolean;
}

const Sidebar: React.FC<Props> = ({ isOpen }) => {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>

            {/* Sidebar Links (you can customize later) */}
            <ul>
                <li>Dashboard</li>
                <li>Traffic Data</li>
                <li>Emergency Mode</li>
                <li>Settings</li>
            </ul>

        </div>
    );
};

export default Sidebar;