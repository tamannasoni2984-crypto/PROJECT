import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { STUDENT_DATASET, getRecommendationsForStudent } from "../data/studentDataset";

const API_URL = import.meta.env.VITE_API_URL || "https://student-performance-prediction-ic0v.onrender.com";

// Module-level in-memory cache to preserve state across tab navigation.
// It will NEVER directly delete results when switching tabs,
// and only resets when the user actually refreshes/reloads the page.
let memoryCsvResults = [];
let memoryFileName = "";
let memorySelectedStudentId = "";

function parseCsvText(csvText) {
  try {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const row = {};
      headers.forEach((h, i) => {
        const val = vals[i] !== undefined ? vals[i] : "";
        row[h] = !isNaN(Number(val)) && val !== "" ? Number(val) : val;
      });
      return row;
    });
  } catch {
    return [];
  }
}

function CSVPrediction() {
  const [csvResults, setCsvResultsState] = useState(memoryCsvResults);
  const [csvLoading, setCsvLoading] = useState(false);
  const [fileName, setFileNameState] = useState(memoryFileName);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedStudentId, setSelectedStudentIdState] = useState(memorySelectedStudentId);

  const navigate = useNavigate();

  const setCsvResults = (val) => {
    memoryCsvResults = val;
    setCsvResultsState(val);
  };

  const setFileName = (val) => {
    memoryFileName = val;
    setFileNameState(val);
  };

  const setSelectedStudentId = (val) => {
    memorySelectedStudentId = val;
    setSelectedStudentIdState(val);
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg("");
    setCsvLoading(true);

    try {
      // 1. Read CSV text directly so all feature columns (study_hours, attendance, etc.) are always available
      const text = await file.text();
      const parsedRows = parseCsvText(text);

      // 2. Call backend /predict-csv
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/predict-csv`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || "Failed to process CSV file.");
        setCsvResults([]);
        return;
      }

      const merged = data.results.map((item, idx) => {
        const parsed = parsedRows[idx] || {};
        return {
          student: item.student,
          predicted_score: item["predicted score"] !== undefined ? item["predicted score"] : item.predicted_score,
          category: item.category,
          study_hours: item.study_hours !== undefined ? item.study_hours : parsed.study_hours,
          attendance: item.attendance !== undefined ? item.attendance : parsed.attendance,
          previous_score: item.previous_score !== undefined ? item.previous_score : parsed.previous_score,
          assignment_completed: item.assignment_completed !== undefined ? item.assignment_completed : parsed.assignment_completed,
          sleep_hours: item.sleep_hours !== undefined ? item.sleep_hours : parsed.sleep_hours,
          extracurricular: item.extracurricular !== undefined ? item.extracurricular : parsed.extracurricular,
        };
      });

      setCsvResults(merged);
      setSelectedStudentId("");
    } catch (error) {
      console.error("CSV upload error:", error);
      setErrorMsg("Unable to connect to backend server. Make sure the API is running.");
    } finally {
      setCsvLoading(false);
    }
  };

  // 1-Click Load Built-in CSV Dataset (20 Students)
  const handleLoadDefaultDataset = () => {
    setFileName("student_data.csv (Built-in Dataset)");
    setErrorMsg("");
    const formatted = STUDENT_DATASET.map((item) => ({
      student: item.student || item.id,
      predicted_score: item.final_score !== undefined ? item.final_score : item.predicted_score,
      category: item.category,
      study_hours: item.study_hours,
      attendance: item.attendance,
      previous_score: item.previous_score,
      assignment_completed: item.assignment_completed,
      sleep_hours: item.sleep_hours,
      extracurricular: item.extracurricular,
    }));
    setCsvResults(formatted);
    setSelectedStudentId("");
  };

  const handleDownloadSample = () => {
    const sampleCsvContent = `study_hours,attendance,previous_score,assignment_completed,sleep_hours,extracurricular
6.5,88,85,92,7.5,1
4.0,72,60,65,6.0,0
8.0,95,90,98,8.0,1
2.5,50,45,40,5.5,0
5.0,80,75,85,7.0,1
`;
    const blob = new Blob([sampleCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_student_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearResults = () => {
    setCsvResults([]);
    setFileName("");
    setSelectedStudentId("");
    setErrorMsg("");
  };

  const calculateBatchStats = () => {
    if (csvResults.length === 0) return null;
    const scores = csvResults.map((r) => Number(r.predicted_score));
    const total = scores.length;
    const average = (scores.reduce((sum, s) => sum + s, 0) / total).toFixed(2);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    return { total, average, highest, lowest };
  };

  const stats = calculateBatchStats();

  const selectedStudentObj = csvResults.find(
    (s) => String(s.student) === String(selectedStudentId)
  );

  const handleOpenInPredictor = (student) => {
    navigate("/prediction", { state: { student } });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📁 Multiple Student Batch Prediction</h1>
        <p className="subtitle">
          Upload a CSV dataset or test immediately to view scores of every student. Click on any student to directly inspect their indicators.
        </p>
      </div>

      <div className="card">
        <div className="csv-upload-header">
          <div>
            <h2>Upload Student Dataset (.csv)</h2>
            <p className="section-description">
              Upload your own CSV or test with our ready 20-student dataset. Results persist as you switch tabs until you refresh the page.
            </p>
          </div>
          <div className="csv-action-btns">
            <button
              type="button"
              onClick={handleLoadDefaultDataset}
              className="quick-dataset-btn"
            >
              ⚡ Load Default Dataset (20 Students)
            </button>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="sample-download-btn"
            >
              📥 Download Sample CSV
            </button>
          </div>
        </div>

        <div className="file-drop-area">
          <input
            id="csvFileInput"
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="file-input-hidden"
          />
          <label htmlFor="csvFileInput" className="file-drop-label">
            <div className="upload-icon">📄</div>
            <span className="upload-prompt">
              {fileName ? `Loaded: ${fileName}` : "Click to select or drop CSV file here"}
            </span>
            <span className="upload-subtext">Supported format: .csv</span>
          </label>
        </div>

        {csvLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="csv-loading">Processing student dataset and computing predictions...</p>
          </div>
        )}

        {errorMsg && <div className="error-alert">{errorMsg}</div>}
      </div>

      {stats && (
        <div className="analytics" style={{ marginTop: "25px" }}>
          <div className="section-header">
            <h2>Batch Summary</h2>
            <span className="persistence-badge">
              💾 Results preserved across tabs (resets on page refresh)
            </span>
          </div>
          <div className="analytics-grid">
            <div className="analytics-card">
              <span>Students Processed</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="analytics-card">
              <span>Batch Average</span>
              <strong>{stats.average}</strong>
            </div>
            <div className="analytics-card">
              <span>Highest Predicted</span>
              <strong>{stats.highest}</strong>
            </div>
            <div className="analytics-card">
              <span>Lowest Predicted</span>
              <strong>{stats.lowest}</strong>
            </div>
          </div>
        </div>
      )}

      {csvResults.length > 0 && (
        <div className="card" style={{ marginTop: "25px" }}>
          {/* Header with Student Dropdown */}
          <div className="section-header" style={{ flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2>Batch Prediction Results ({csvResults.length})</h2>
              <p className="section-description" style={{ marginBottom: "0" }}>
                Select a particular student from the dropdown or click any student row below to directly see their score and details.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearResults}
              className="secondary-btn"
              style={{ padding: "8px 16px", fontSize: "13px" }}
              title="Clear current results"
            >
              ✕ Clear Dataset
            </button>
          </div>

          {/* Student Selector Dropdown Bar */}
          <div className="csv-student-selector-bar">
            <div className="dropdown-input-wrapper">
              <label htmlFor="studentDropdownSelect" className="control-label">
                🎯 Choose Student to Inspect Score & Details:
              </label>
              <select
                id="studentDropdownSelect"
                className="student-main-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">👥 Every Student (Show All {csvResults.length} Scores)</option>
                {csvResults.map((item) => (
                  <option key={item.student} value={item.student}>
                    Student {item.student} — Score: {item.predicted_score} | {item.category}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudentId && (
              <button
                type="button"
                className="stepper-btn-secondary"
                onClick={() => setSelectedStudentId("")}
                style={{ alignSelf: "flex-end" }}
              >
                Show All Students
              </button>
            )}
          </div>

          {/* DIRECT STUDENT DETAIL CARD (Appears when a student is clicked or selected from dropdown) */}
          {selectedStudentObj && (
            <div className="direct-student-card">
              <div className="direct-student-header">
                <div>
                  <span className="selector-eyebrow">STUDENT SCORE & INDICATORS</span>
                  <h3>Student #{selectedStudentObj.student}</h3>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span className={`badge badge-${selectedStudentObj.category?.toLowerCase().replace(/\s+/g, "-")}`}>
                    {selectedStudentObj.category}
                  </span>
                  <button
                    type="button"
                    className="close-card-btn"
                    onClick={() => setSelectedStudentId("")}
                    title="Close details"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="score-display" style={{ margin: "14px 0" }}>
                <h2>{selectedStudentObj.predicted_score}</h2>
                <span className="score-max">/ 100</span>
              </div>

              {selectedStudentObj.study_hours !== undefined && (
                <div className="student-metric-grid">
                  <div className="metric-box">
                    <span>Study Hours</span>
                    <strong>{selectedStudentObj.study_hours} hrs/day</strong>
                  </div>
                  <div className="metric-box">
                    <span>Attendance</span>
                    <strong>{selectedStudentObj.attendance}%</strong>
                  </div>
                  <div className="metric-box">
                    <span>Previous Score</span>
                    <strong>{selectedStudentObj.previous_score}</strong>
                  </div>
                  <div className="metric-box">
                    <span>Assignments</span>
                    <strong>{selectedStudentObj.assignment_completed}%</strong>
                  </div>
                  <div className="metric-box">
                    <span>Sleep Hours</span>
                    <strong>{selectedStudentObj.sleep_hours} hrs/day</strong>
                  </div>
                  <div className="metric-box">
                    <span>Extracurricular</span>
                    <strong>{selectedStudentObj.extracurricular === 1 || selectedStudentObj.extracurricular === "1" ? "Yes" : "No"}</strong>
                  </div>
                </div>
              )}

              <div className="inspect-recommendations">
                <h4>Academic Performance Guidance</h4>
                <ul>
                  {getRecommendationsForStudent(selectedStudentObj).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="primary-btn"
                  style={{ width: "auto", padding: "10px 20px" }}
                  onClick={() => handleOpenInPredictor(selectedStudentObj)}
                >
                  🎯 Open & Tweak in Single Predictor
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setSelectedStudentId("")}
                >
                  View All Student Scores Table
                </button>
              </div>
            </div>
          )}

          {/* EVERY STUDENT SCORES TABLE */}
          <div className="csv-table-container" style={{ marginTop: "16px" }}>
            <table className="interactive-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th style={{ textAlign: "center" }}>Predicted Score</th>
                  <th style={{ textAlign: "center" }}>Performance Level</th>
                  <th style={{ textAlign: "center" }}>Direct Inspection</th>
                </tr>
              </thead>
              <tbody>
                {csvResults.map((item, index) => {
                  const isSelected = String(item.student) === String(selectedStudentId);

                  return (
                    <tr
                      key={item.student || index}
                      className={`table-row-clickable ${isSelected ? "row-selected" : ""}`}
                      onClick={() => setSelectedStudentId(isSelected ? "" : String(item.student))}
                      title="Click directly to view student scores and metrics"
                    >
                      <td>
                        <strong>Student {item.student}</strong>
                        {isSelected && <span className="active-row-indicator"> • Selected</span>}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="table-score">{String(item.predicted_score)}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge badge-${item.category?.toLowerCase().replace(/\s+/g, "-")}`}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="inspect-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(isSelected ? "" : String(item.student));
                          }}
                        >
                          {isSelected ? "Hide Details ▲" : "View Score Details ▼"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CSVPrediction;
