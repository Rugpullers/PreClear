import React from "react";
import AnimatedLoginButton from "./AnimatedLoginButton/AnimatedLoginButton";
import GradientText from "./GradientText";

interface Props {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    onLoginClick: () => void;
    isLoggedIn: boolean;
}

const Navbar: React.FC<Props> = ({ toggleSidebar, isSidebarOpen, onLoginClick, isLoggedIn }) => {
    return (
        <nav className="navbar">
            {/* Hamburger menu */}
            <div
                className={`menu-icon ${isSidebarOpen ? "active" : ""}`}
                onClick={toggleSidebar}
            >
                <div></div>
                <div></div>
                <div></div>
            </div>

            {/* Centered project title */}
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

            {/* Animated login button */}
            <AnimatedLoginButton onClick={onLoginClick} isLoggedIn={isLoggedIn} />
        </nav>
    );
};

export default Navbar;
