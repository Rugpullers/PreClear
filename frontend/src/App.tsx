import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container">

      {/* 🔥 DYNAMIC BACKGROUND AREA */}
      {/* TODO: Add your dynamic background animation here */}
      {/* Example: canvas / particles / gradient animation */}
      <div className="background-layer"></div>

      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <Sidebar isOpen={isSidebarOpen} />

      <main className="main-content">

      </main>

      <Footer />
    </div>
  );
}

export default App;