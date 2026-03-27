# 🚦 PreClear AI Demo Flow

Follow this flow to manually test the intelligent traffic management platform.

### **1. The Hook: Landing Intro**
- **Where to start**: Navigate to [http://localhost:5173/](http://localhost:5173/)
- **Action**: Use your mouse to **Scroll Down**.
- **What to see**: Watch the "Sky-to-Street" animation as the platform explains its core mission.
- **Goal**: Transition to the **Home Page**.

---

### **2. Dashboard Overview**
- **Where to start**: Navigate to [http://localhost:5173/home](http://localhost:5173/home)
- **Action**: Open the **Sidebar** and explore the "About" and "Traffic Data" links.
- **What to see**: Integrated login yeti (if you go to login) and the dark glassmorphism navigation menu.

---

### **3. Live Congestion Heatmap**
- **Where to start**: Navigate to [http://localhost:5173/traffic-data](http://localhost:5173/traffic-data)
- **Action**: Watch the 10 junction markers.
- **What to see**:
    - Observe the junction colors (🟢 LOW, 🟡 MEDIUM, 🔴 HIGH).
    - **Wait 5-10 seconds** and watch as they **change colors automatically** based on live data from the feeder.
    - Check the "Last Updated" timestamp in the bottom-right info panel.
- **Goal**: Verify real-time traffic monitoring.

---

### **4. Route Planner (A* Integration)**
- **Where to start**: Navigate to [http://localhost:5173/route-planner](http://localhost:5173/route-planner)
- **Action**:
    - Choose a **Source** (e.g., "Hebbal Flyover").
    - Choose a **Destination** (e.g., "Electronic City Flyover").
    - Click **"Find Optimal Route"**.
- **What to see**:
    - The A* algorithm calculates the best path using **live ML predictions** from the backend.
    - Path is drawn on real roads (OSRM).
    - A step-by-step route card appears on the left with **Congestion Badges** per segment.
- **Goal**: Verify AI-driven pathfinding.

---

### **5. Emergency Mode**
- **Where to start**: On the Route Planner page.
- **Action**: Click the **"🚑 Ambulance"** toggle button.
- **What to see**: Priority alert notification for clearing "Green Corridors" on the current route.
- **Goal**: Verify emergency prioritization logic.

---

**Happy Testing!** 🚀
