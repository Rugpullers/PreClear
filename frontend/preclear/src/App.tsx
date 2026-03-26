import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RoutePlanner from "./pages/RoutePlanner/RoutePlanner";
import AboutPage from "./pages/AboutPage/AboutPage";
import GradientText from "./components/GradientText";
import "./App.css";

function App() {
  return (
    <>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/route-planner" element={<RoutePlanner />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
      <GradientText
        colors={["#ff0000", "#ffff00", "#00ff00"]}
        animationSpeed={4}
        showBorder={false}
        className="custom-class"
      >
        {/* Add a splash of color! */}
      </GradientText>
    </>
  );
}

export default App;