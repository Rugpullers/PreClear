import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Clouds from "../components/Clouds";
import LoadingOverlay from "../components/LoadingOverlay/LoadingOverlay";

function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLoginClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/login");
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

  return (
    <>
      <Clouds />
      <Navbar
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onLoginClick={handleLoginClick}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        onRoutePlannerClick={handleRoutePlannerClick}
        onTrafficDataClick={handleTrafficDataClick}
        onAboutClick={handleAboutClick}
      />
      <main className="main-content">
        {/* Home content can go here */}
      </main>
      {isLoading && <LoadingOverlay />}
    </>
  );
}

export default HomePage;
