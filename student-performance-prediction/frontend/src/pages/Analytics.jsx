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
  PieChart,
  Pie,
} from "recharts";
import { STUDENT_DATASET } from "../data/studentDataset";

const API_URL = import.meta.env.VITE_API_URL || "https://student-performance-prediction-ic0v.onrender.com";

// Custom label inside or around the Pie slices
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function Analytics() {
  const [history, setHistory] = useState([]);
  const [dataSource, setDataSource] = useState("auto"); // "saved" or "csv" or "auto"
  const [analytics, setAnalytics] = useState({
    total: 0,
    average: 0,
    highest: 0,
    lowest: 0,
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Process data into stats, line chart, bar chart, and pie chart
  const processDataset = (data, isSaved) => {
    if (!data || data.length === 0) {
      setPerformanceData([]);
      setDistributionData([]);
      setPieData([]);
      setAnalytics({ total: 0, average: 0, highest: 0, lowest: 0 });
      return;
    }

    const scores = data.map((item) =>
      Number(item.predicted_score !== undefined ? item.predicted_score : item.final_score)
    );
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

    setPerformanceData(
      data
        .slice()
        .reverse()
        .map((item, index) => ({
          prediction: index + 1,
          score: Number(item.predicted_score !== undefined ? item.predicted_score : item.final_score),
          created: item.created_at || (item.student ? `Student #${item.student}` : `#${index + 1}`),
        }))
    );

    // Compute distribution counts
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

    // Bar chart data
    setDistributionData([
      { category: "Excellent (≥80)", count: categories.Excellent, color: "#10b981" },
      { category: "Good (60-79)", count: categories.Good, color: "#6366f1" },
      { category: "Average (40-59)", count: categories.Average, color: "#f59e0b" },
      { category: "Needs Improvement (<40)", count: categories["Needs Improvement"], color: "#ef4444" },
    ]);

    // Pie chart data (only categories with > 0 students)
    const pieItems = [
      {
        name: "Excellent (≥80)",
        category: "Excellent",
        count: categories.Excellent,
        percent: Number(((categories.Excellent / total) * 100).toFixed(1)),
        color: "#10b981",
      },
      {
        name: "Good (60-79)",
        category: "Good",
        count: categories.Good,
        percent: Number(((categories.Good / total) * 100).toFixed(1)),
        color: "#6366f1",
      },
      {
        name: "Average (40-59)",
        category: "Average",
        count: categories.Average,
        percent: Number(((categories.Average / total) * 100).toFixed(1)),
        color: "#f59e0b",
      },
      {
        name: "Needs Improvement (<40)",
        category: "Needs Improvement",
        count: categories["Needs Improvement"],
        percent: Number(((categories["Needs Improvement"] / total) * 100).toFixed(1)),
        color: "#ef4444",
      },
    ].filter((item) => item.count > 0);

    setPieData(pieItems);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/predictions`);
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
          if (data && data.length > 0) {
            setDataSource("saved");
            processDataset(data, true);
          } else {
            // Default to CSV Dataset if no saved predictions yet
            setDataSource("csv");
            processDataset(STUDENT_DATASET, false);
          }
        } else {
          setDataSource("csv");
          processDataset(STUDENT_DATASET, false);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setDataSource("csv");
        processDataset(STUDENT_DATASET, false);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleSourceChange = (source) => {
    setDataSource(source);
    if (source === "saved") {
      processDataset(history, true);
    } else {
      processDataset(STUDENT_DATASET, false);
    }
  };

  const hasData = performanceData.length > 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📈 Performance Analytics</h1>
        <p className="subtitle">
          In-depth insights, score trajectories, category share pie charts, and distribution breakdowns across student evaluations.
        </p>
      </div>

      {/* Data Source Selector */}
      <div className="analytics-source-bar">
        <span className="control-label">Analytics Data Source:</span>
        <div className="view-mode-tabs" role="tablist">
          <button
            type="button"
            className={`tab-btn ${dataSource === "saved" ? "active" : ""}`}
            onClick={() => handleSourceChange("saved")}
            disabled={history.length === 0}
            title={history.length === 0 ? "No saved predictions yet in database" : "View saved evaluations"}
          >
            🎯 Saved Predictions ({history.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${dataSource === "csv" ? "active" : ""}`}
            onClick={() => handleSourceChange("csv")}
          >
            📁 CSV Dataset Cohort ({STUDENT_DATASET.length} Students)
          </button>
        </div>
        {dataSource === "csv" && (
          <span className="source-note">
            Showing benchmark cohort from CSV dataset
          </span>
        )}
      </div>

      {/* Key Performance Indicators */}
      <div className="analytics">
        <h2>Key Performance Indicators</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <span>Total Evaluated</span>
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

      {hasData ? (
        <>
          {/* CHARTS GRID: PIE CHART & BAR CHART */}
          <div className="analytics-charts-grid" style={{ marginTop: "30px" }}>
            {/* 1. PIE CHART */}
            <div className="performance-chart pie-chart-card">
              <div className="chart-card-header">
                <div>
                  <span className="selector-eyebrow">CATEGORY SHARE</span>
                  <h2>Performance Category Share (Pie Chart)</h2>
                </div>
                <span className="chart-tag">🥧 Pie Chart</span>
              </div>
              <p className="section-description">
                Proportion of students belonging to each performance category tier.
              </p>

              <div className="pie-chart-wrapper">
                <ResponsiveContainer width="100%" height={290}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                      cornerRadius={6}
                      dataKey="count"
                      nameKey="name"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`pie-cell-${index}`}
                          fill={entry.color}
                          stroke="#1e293b"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} Students`, name]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#475569",
                        borderRadius: "8px",
                        color: "#f8fafc",
                      }}
                    />
                    <Legend
                      formatter={(value, entry) => {
                        const item = pieData.find((p) => p.name === value);
                        return (
                          <span style={{ color: "#cbd5e1", fontSize: "12px", marginRight: "8px" }}>
                            {value} <strong>({item ? `${item.count}` : ""})</strong>
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Share Category Metric Pills */}
              <div className="pie-share-breakdown">
                {pieData.map((item) => (
                  <div className="pie-share-pill" key={item.category}>
                    <span className="pie-color-dot" style={{ backgroundColor: item.color }}></span>
                    <span className="pie-pill-name">{item.category}:</span>
                    <strong>{item.count}</strong>
                    <span className="pie-pill-pct">({item.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. BAR CHART */}
            <div className="performance-chart bar-chart-card">
              <div className="chart-card-header">
                <div>
                  <span className="selector-eyebrow">DISTRIBUTION</span>
                  <h2>Performance Category Distribution</h2>
                </div>
                <span className="chart-tag">📊 Bar Chart</span>
              </div>
              <p className="section-description">
                Count of students categorized by their predicted score bracket.
              </p>

              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={distributionData} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="category"
                    stroke="#94a3b8"
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
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
          </div>

          {/* 3. LINE CHART (SCORE TREND) */}
          <div className="performance-chart" style={{ marginTop: "30px" }}>
            <div className="chart-card-header">
              <div>
                <span className="selector-eyebrow">SEQUENCE TRAJECTORY</span>
                <h2>Prediction Score Trend</h2>
              </div>
              <span className="chart-tag">📈 Line Chart</span>
            </div>
            <p className="section-description">
              Sequential score progression of predicted student scores over time.
            </p>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="prediction"
                  stroke="#94a3b8"
                  label={{
                    value: "Student Sequence #",
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
        </>
      ) : (
        <div className="empty-state-card" style={{ marginTop: "30px" }}>
          <div className="empty-icon">📊</div>
          <h3>No Analytics Available Yet</h3>
          <p>Make predictions to generate data points and visual analytics, or inspect the CSV cohort.</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => handleSourceChange("csv")}
            >
              📁 View CSV Cohort Analytics
            </button>
            <Link to="/prediction" className="primary-btn" style={{ maxWidth: "220px" }}>
              🎯 Create Prediction
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
