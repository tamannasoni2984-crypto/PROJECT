import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ModelComparison() {
  const [modelComparison, setModelComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModelComparison = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/model-comparison");
        const data = await response.json();

        const formattedData = Object.entries(data).map(([model, values]) => ({
          model,
          MAE: Number(values.MAE.toFixed(2)),
          R2: Number(values.R2.toFixed(3)),
          rawMAE: values.MAE,
          rawR2: values.R2,
        }));

        setModelComparison(formattedData);
      } catch (error) {
        console.error("Error fetching model comparison:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModelComparison();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🧠 Machine Learning Model Comparison</h1>
        <p className="subtitle">
          Benchmarking regression algorithms on evaluation metrics: Mean Absolute Error (MAE) and Coefficient of Determination (R² Score).
        </p>
      </div>

      <div className="model-comparison-container">
        <div className="model-chart-card">
          <h2>Evaluation Metrics Comparison</h2>
          <p className="section-description">
            Lower MAE indicates smaller average error; Higher R² (closest to 1.0) represents superior variance explanation.
          </p>

          <div className="model-chart">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={modelComparison} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="model" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Legend />
                <Bar dataKey="MAE" name="MAE (Lower is Better)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="R2" name="R² Score (Higher is Better)" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="model-results-section">
          <h2>Model Breakdown & Scores</h2>
          <div className="model-results">
            {modelComparison.map((item) => {
              const isBest = item.model === "Linear Regression";
              return (
                <div className={`model-card ${isBest ? "best-model" : ""}`} key={item.model}>
                  <div className="model-card-header">
                    <h3>{item.model}</h3>
                    {isBest && <span className="best-badge">⭐ Recommended</span>}
                  </div>

                  <div className="model-metric-row">
                    <span>Mean Absolute Error (MAE)</span>
                    <strong>{item.MAE}</strong>
                  </div>

                  <div className="model-metric-row">
                    <span>R² Score (Variance)</span>
                    <strong>{item.R2}</strong>
                  </div>

                  <p className="model-desc">
                    {item.model === "Linear Regression" &&
                      "Delivers highest predictive accuracy with the lowest generalization error across continuous student factors."}
                    {item.model === "Decision Tree" &&
                      "Non-linear rule-based tree model; effective for segmented patterns but slightly higher variance on continuous targets."}
                    {item.model === "Random Forest" &&
                      "Ensemble of bagged trees providing robustness against overfitting with stable generalization."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ marginTop: "30px" }}>
          <h2>Metric Interpretation Guide</h2>
          <div className="metrics-guide-grid">
            <div className="guide-box">
              <h4>🎯 Mean Absolute Error (MAE)</h4>
              <p>
                Measures the average magnitude of prediction errors in the same units as the student final score (0–100 scale). An MAE of 0.74 means predictions are off by less than 1 point on average.
              </p>
            </div>
            <div className="guide-box">
              <h4>📊 R² Score (Coefficient of Determination)</h4>
              <p>
                Represents the proportion of score variance predictable from study hours, attendance, sleep, and assignments. An R² of 0.997 indicates 99.7% of performance variance is accurately captured.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelComparison;
