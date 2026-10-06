import React, { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://student-performance-prediction-ic0v.onrender.com";
function Prediction() {
  const [formData, setFormData] = useState({
    study_hours: "",
    attendance: "",
    previous_score: "",
    assignment_completed: "",
    sleep_hours: "",
    extracurricular: "0",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_URL}/predictions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          study_hours: Number(formData.study_hours),
          attendance: Number(formData.attendance),
          previous_score: Number(formData.previous_score),
          assignment_completed: Number(formData.assignment_completed),
          sleep_hours: Number(formData.sleep_hours),
          extracurricular: Number(formData.extracurricular),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate prediction from backend API.");
      }

      const data = await response.json();
      const score = data.predicted_score;
      const category = data.category;

      const recommendations = [];

      if (Number(formData.study_hours) < 4) {
        recommendations.push("Increase daily study hours to at least 4 hours.");
      } else {
        recommendations.push("Your daily study routine is effective. Maintain this momentum.");
      }

      if (Number(formData.attendance) < 75) {
        recommendations.push("Attendance is below 75%. Prioritize regular lecture attendance.");
      } else {
        recommendations.push("Great lecture attendance. Consistent participation pays off.");
      }

      if (Number(formData.assignment_completed) < 75) {
        recommendations.push("Complete coursework and assignments on time to avoid grade loss.");
      } else {
        recommendations.push("Consistent assignment submission helps retain key subject concepts.");
      }

      if (Number(formData.sleep_hours) < 7) {
        recommendations.push("Aim for 7–8 hours of restorative sleep to enhance cognitive focus.");
      } else {
        recommendations.push("Healthy sleep habits support sustained memory and learning.");
      }

      if (Number(formData.extracurricular) === 1) {
        recommendations.push("Active extracurricular involvement develops balanced soft skills.");
      }

      setPrediction({
        score: score,
        category: category,
        recommendations: recommendations,
      });
    } catch (err) {
      console.error("Prediction error:", err);
      setErrorMsg("Error generating prediction. Please ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      study_hours: "",
      attendance: "",
      previous_score: "",
      assignment_completed: "",
      sleep_hours: "",
      extracurricular: "0",
    });
    setPrediction(null);
    setErrorMsg("");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎯 Student Performance Prediction</h1>
        <p className="subtitle">
          Enter student academic, lifestyle, and participation indicators to predict final exam scores.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="study_hours">Study Hours (Daily)</label>
              <input
                id="study_hours"
                type="number"
                step="0.1"
                min="0"
                max="24"
                name="study_hours"
                placeholder="e.g. 5.5"
                value={formData.study_hours}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="attendance">Attendance (%)</label>
              <input
                id="attendance"
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="attendance"
                placeholder="e.g. 85"
                value={formData.attendance}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="previous_score">Previous Score (0 - 100)</label>
              <input
                id="previous_score"
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="previous_score"
                placeholder="e.g. 78"
                value={formData.previous_score}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="assignment_completed">Assignments Completed (%)</label>
              <input
                id="assignment_completed"
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="assignment_completed"
                placeholder="e.g. 90"
                value={formData.assignment_completed}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sleep_hours">Sleep Hours (Daily)</label>
              <input
                id="sleep_hours"
                type="number"
                step="0.1"
                min="0"
                max="24"
                name="sleep_hours"
                placeholder="e.g. 7"
                value={formData.sleep_hours}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="extracurricular">Extracurricular Activity</label>
              <select
                id="extracurricular"
                name="extracurricular"
                value={formData.extracurricular}
                onChange={handleChange}
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}

          <div className="button-group">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Calculating Prediction..." : "Predict Performance"}
            </button>
            {prediction && (
              <button type="button" onClick={handleReset} className="secondary-btn">
                Reset Form
              </button>
            )}
          </div>
        </form>
      </div>

      {prediction !== null && (
        <div className="result-card">
          <p className="result-title">Predicted Final Score</p>
          <div className="score-display">
            <h2>{prediction.score}</h2>
            <span className="score-max">/ 100</span>
          </div>

          <p className="result-category">
            Performance Level:{" "}
            <span className={`badge badge-${prediction.category.toLowerCase().replace(/\s+/g, "-")}`}>
              {prediction.category}
            </span>
          </p>

          <div className="recommendations">
            <h3>Key Academic Recommendations</h3>
            <ul>
              {prediction.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>

          <div className="result-footer-actions">
            <Link to="/history" className="cta-link">
              View In Prediction History →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prediction;
