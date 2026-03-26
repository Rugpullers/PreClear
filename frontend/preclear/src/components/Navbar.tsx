import React from "react";
import AnimatedLoginButton from "./AnimatedLoginButton/AnimatedLoginButton";
import GradientText from "./GradientText";

interface Props {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    onLoginClick: () => void;
}

const Navbar: React.FC<Props> = ({ toggleSidebar, isSidebarOpen, onLoginClick }) => {
    return (
        <nav className="navbar">

            {/* ☰ SIDEBAR TOGGLE BUTTON (3 lines / hamburger) */}
            {/* Click to open/close sidebar */}
            <div
                className={`menu-icon ${isSidebarOpen ? "active" : ""}`}
                onClick={toggleSidebar}
            >
                <div></div>
                <div></div>
                <div></div>
            </div>

            {/* 🚀 PROJECT NAME (TOP CENTER) */}
            <div className="project-title">
                <GradientText
                    colors={["#000000", "#808080"]}
                    animationSpeed={4.5}
                    showBorder={false}
                    className="custom-class"
                >
                    PreClear
                </GradientText>
            </div>

            {/* 🔐 ANIMATED LOGIN BUTTON (TOP RIGHT CORNER) */}
            <AnimatedLoginButton onClick={onLoginClick} />


        </nav>
    );
};


export default Navbar;