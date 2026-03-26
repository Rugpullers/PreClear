import React from "react";

interface Props {
    toggleSidebar: () => void;
}

const Navbar: React.FC<Props> = ({ toggleSidebar }) => {
    return (
        <nav className="navbar">

            {/* ☰ SIDEBAR TOGGLE BUTTON (3 lines / hamburger) */}
            {/* Click to open/close sidebar */}
            <div className="menu-icon" onClick={toggleSidebar}>
                <div></div>
                <div></div>
                <div></div>
            </div>

            {/* 🚀 PROJECT NAME (TOP CENTER) */}
            <div className="project-title">
                PreClear
            </div>

            {/* 🔐 LOGIN BUTTON (TOP RIGHT CORNER) */}
            {/* TODO: Add routing/auth logic later */}
            <button className="login-btn">
                Login
            </button>

        </nav>
    );
};

export default Navbar;