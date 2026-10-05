import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    average: 0,
    highest: 0,
    lowest: 0,
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/predictions");
        const data = await response.json();

        setHistory(data);

        setPerformanceData(
          data
            .slice()
            .reverse()
            .map((item, index) => ({
              prediction: index + 1,
              score: Number(item.predicted_score),
            }))
        );

        if (data.length > 0) {
          const scores = data.map((item) => Number(item.predicted_score));
          const total = scores.length;
          const average = scores.reduce((sum, score) => sum + score, 0) / total;
          const highest = Math.max(...scores);
          const lowest = Math.min(...scores);

          setAnalytics({
            total,
            average: Number(average.toFixed(2)),
            highest,
            lowest,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-container">
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Student Performance Dashboard</h1>
          <p className="subtitle">
            Predict student outcomes, evaluate ML models, and uncover actionable academic insights.
          </p>
        </div>
        <div className="hero-actions">
          <Link to="/prediction" className="hero-btn primary">
            🎯 New Prediction
          </Link>
          <Link to="/csv" className="hero-btn secondary">
            📁 Batch CSV Predict
          </Link>
        </div>
      </div>

      <div className="analytics">
        <h2>System Overview</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <span>Total Predictions</span>
            <strong>{analytics.total}</strong>
          </div>

          <div className="analytics-card">
            <span>Average Score</span>
            <strong>{analytics.average}</strong>
          </div>

          <div className="analytics-card">
            <span>Highest Score</span>
            <strong>{analytics.highest}</strong>
          </div>

          <div className="analytics-card">
            <span>Lowest Score</span>
            <strong>{analytics.lowest}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="performance-chart">
          <div className="section-header">
            <h2>Recent Performance Trend</h2>
            <Link to="/analytics" className="view-more-link">
              Detailed Analytics →
            </Link>
          </div>

          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="prediction"
                  stroke="#94a3b8"
                  label={{
                    value: "Prediction #",
                    position: "insideBottom",
                    offset: -5,
                    fill: "#94a3b8",
                  }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  label={{
                    value: "Score",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#94a3b8",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Predicted Score"
                  stroke="#818cf8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#818cf8" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart-placeholder">
              <p>No prediction data recorded yet.</p>
              <Link to="/prediction" className="cta-link">
                Make your first prediction
              </Link>
            </div>
          )}
        </div>

        <div className="quick-nav-card">
          <h2>Quick Navigation</h2>
          <div className="quick-nav-links">
            <Link to="/prediction" className="quick-nav-item">
              <div className="quick-nav-icon">🎯</div>
              <div>
                <strong>Individual Prediction</strong>
                <p>Input study metrics to predict individual student performance</p>
              </div>
            </Link>

            <Link to="/csv" className="quick-nav-item">
              <div className="quick-nav-icon">📁</div>
              <div>
                <strong>Batch CSV Upload</strong>
                <p>Upload CSV to predict multiple student records simultaneously</p>
              </div>
            </Link>

            <Link to="/models" className="quick-nav-item">
              <div className="quick-nav-icon">🧠</div>
              <div>
                <strong>Model Comparison</strong>
                <p>Compare Linear Regression, Decision Trees, and Random Forests</p>
              </div>
            </Link>

            <Link to="/history" className="quick-nav-item">
              <div className="quick-nav-icon">🕒</div>
              <div>
                <strong>Prediction History</strong>
                <p>Review and manage all past prediction records</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="recent-history-section">
          <div className="section-header">
            <h2>Recent Predictions</h2>
            <Link to="/history" className="view-more-link">
              View All ({history.length}) →
            </Link>
          </div>

          <div className="history-list">
            {history.slice(0, 3).map((item) => (
              <div className="history-card" key={item.id}>
                <div>
                  <strong>{item.created_at || "Recent"}</strong>
                  <div className="history-details">
                    <span>Attendance: {item.attendance}%</span>
                    <span>Study Hours: {item.study_hours} hrs</span>
                    <span>Previous Score: {item.previous_score}</span>
                    <span>Assignment: {item.assignment_completed}%</span>
                    <span>Sleep: {item.sleep_hours} hrs</span>
                    <span>Extracurricular: {item.extracurricular === 1 ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div className="history-score">
                  <strong>{item.predicted_score}</strong>
                  <span className={`badge badge-${item.category.toLowerCase().replace(/\s+/g, "-")}`}>
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
