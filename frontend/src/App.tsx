import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RoutePlanner from "./pages/RoutePlanner/RoutePlanner";
import AboutPage from "./pages/AboutPage/AboutPage";
import ScrollAnimation from "./components/ScrollAnimation";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Scroll animation intro — "Get Started" button at the end navigates to /home */}
        <Route path="/" element={<ScrollAnimation />} />
        {/* Full landing page with Navbar, Sidebar, Clouds, features, etc. */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

export default App;
