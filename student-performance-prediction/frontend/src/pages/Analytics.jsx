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
  BarChart,
  Bar,
  Cell,
} from "recharts";

function Analytics() {
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    average: 0,
    highest: 0,
    lowest: 0,
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
              created: item.created_at || `#${index + 1}`,
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

          // Compute distribution
          const categories = {
            Excellent: 0,
            Good: 0,
            Average: 0,
            "Needs Improvement": 0,
          };

          data.forEach((item) => {
            const cat = item.category || "Average";
            if (categories[cat] !== undefined) {
              categories[cat] += 1;
            } else {
              categories["Average"] += 1;
            }
          });

          setDistributionData([
            { category: "Excellent (≥80)", count: categories.Excellent, color: "#10b981" },
            { category: "Good (60-79)", count: categories.Good, color: "#6366f1" },
            { category: "Average (40-59)", count: categories.Average, color: "#f59e0b" },
            { category: "Needs Improvement (<40)", count: categories["Needs Improvement"], color: "#ef4444" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📈 Performance Analytics</h1>
        <p className="subtitle">
          In-depth insights, score trajectories, and category distributions across all recorded evaluations.
        </p>
      </div>

      <div className="analytics">
        <h2>Key Performance Indicators</h2>
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

      {history.length > 0 ? (
        <>
          <div className="performance-chart">
            <h2>Prediction Score Trend</h2>
            <p className="section-description">
              Sequential score progression of predicted student scores over time.
            </p>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="prediction"
                  stroke="#94a3b8"
                  label={{
                    value: "Prediction Sequence",
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
                  dot={{ r: 5, fill: "#818cf8" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="performance-chart" style={{ marginTop: "30px" }}>
            <h2>Performance Category Distribution</h2>
            <p className="section-description">
              Count of students categorized by their predicted score bracket.
            </p>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="count" name="Number of Students" radius={[6, 6, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="empty-state-card">
          <div className="empty-icon">📊</div>
          <h3>No Analytics Available Yet</h3>
          <p>Make predictions to generate data points and visual analytics.</p>
          <Link to="/prediction" className="primary-btn" style={{ maxWidth: "250px", margin: "20px auto 0" }}>
            Create First Prediction
          </Link>
        </div>
      )}
    </div>
  );
}

export default Analytics;
