# 🚀 PreClear AI Setup Guide

Follow these steps to get the entire PreClear Intelligent Traffic System up and running for a manual test.

### **1. Prerequisites**
Ensure you have the following installed:
- [Docker & Docker Compose](https://www.docker.com/get-started)
- [Node.js 18+](https://nodejs.org/)

---

### **2. Launch Backend & AI Services**
Open a terminal in the root `PreClear` directory and run:

```powershell
# Build and start Backend, ML Service, and MongoDB in detached mode
docker-compose up --build -d
```

**Wait ~10 seconds** for the ML models to load and the **Data Feeder** to initialize. The feeder will automatically start injecting live traffic records from the 15,000-row CSV dataset into MongoDB.

---

### **3. Launch Frontend**
Open a **new** terminal in the `frontend` directory:

```powershell
cd frontend

# Install dependencies (only required first time)
npm install --legacy-peer-deps

# Start Vite development server
npm run dev
```

---

### **4. Verify Services**
Once everything is running, you can verify the status via these links:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Feeder Status**: [http://localhost:8000/feeder/status](http://localhost:8000/feeder/status) (Look for `"running": true`)
