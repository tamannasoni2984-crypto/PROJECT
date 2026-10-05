import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Prediction from "./pages/Prediction";
import Analytics from "./pages/Analytics";
import ModelComparison from "./pages/ModelComparison";
import CSVPrediction from "./pages/CSVPrediction";
import PredictionHistory from "./pages/PredictionHistory";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/predict" element={<Navigate to="/prediction" replace />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/models" element={<ModelComparison />} />
            <Route path="/model-comparison" element={<Navigate to="/models" replace />} />
            <Route path="/csv" element={<CSVPrediction />} />
            <Route path="/csv-prediction" element={<Navigate to="/csv" replace />} />
            <Route path="/history" element={<PredictionHistory />} />
            <Route path="/prediction-history" element={<Navigate to="/history" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} Student Performance Prediction & Analytics System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
