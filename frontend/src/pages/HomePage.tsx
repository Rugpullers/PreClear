import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Clouds from "../components/Clouds";
import LoadingOverlay from "../components/LoadingOverlay/LoadingOverlay";

function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLoginClick = () => {
    if (isLoggedIn) {
      // Already logged in → logout (just toggle state, no navigation)
      setIsLoggedIn(false);
    } else {
      // Not logged in → navigate to login page, mark as logged in on return
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsLoggedIn(true);
        navigate("/login");
      }, 2000);
    }
  };

  const handleDashboardClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 2000);
  };

  const handleRoutePlannerClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/route-planner");
    }, 2000);
  };

  const handleAboutClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/about");
    }, 2000);
  };

  const handleTrafficDataClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/traffic-data");
    }, 2000);
  };

  const handleSettingsClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/settings");
    }, 2000);
  };

  return (
    <>
      <Clouds />
      <Navbar
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onLoginClick={handleLoginClick}
        isLoggedIn={isLoggedIn}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        onDashboardClick={handleDashboardClick}
        onRoutePlannerClick={handleRoutePlannerClick}
        onTrafficDataClick={handleTrafficDataClick}
        onAboutClick={handleAboutClick}
        onSettingsClick={handleSettingsClick}
      />
      <main className="main-content">
        {/* Home content can go here */}
      </main>
      {isLoading && <LoadingOverlay />}
    </>
  );
}

export default HomePage;

