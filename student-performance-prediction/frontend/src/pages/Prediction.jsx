import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { STUDENT_DATASET, getRecommendationsForStudent } from "../data/studentDataset";

const API_URL = import.meta.env.VITE_API_URL || "https://student-performance-prediction-ic0v.onrender.com";

// Module-level in-memory cache to preserve predictor form across tab navigation.
// It will NEVER directly delete inputs or predictions until the user actually refreshes the page.
let memoryPredictionFormData = {
  study_hours: "",
  attendance: "",
  previous_score: "",
  assignment_completed: "",
  sleep_hours: "",
  extracurricular: "0",
};
let memoryPredictionResult = null;
let memorySelectedPredictionStudentId = "";
let memoryViewMode = "particular";

function Prediction() {
  const location = useLocation();

  // Mode selection: "particular" (individual student) or "all" (every student)
  const [viewMode, setViewModeState] = useState(memoryViewMode);

  // Dataset of students (initialized from bundled CSV data, updated if API available)
  const [dataset, setDataset] = useState(STUDENT_DATASET);

  // Selected student from CSV dropdown ("" for manual/custom)
  const [selectedStudentId, setSelectedStudentIdState] = useState(memorySelectedPredictionStudentId);

  // Form input fields
  const [formData, setFormDataState] = useState(memoryPredictionFormData);

  const [prediction, setPredictionState] = useState(memoryPredictionResult);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const setViewMode = (val) => {
    memoryViewMode = val;
    setViewModeState(val);
  };

  const setSelectedStudentId = (val) => {
    memorySelectedPredictionStudentId = val;
    setSelectedStudentIdState(val);
  };

  const setFormData = (val) => {
    memoryPredictionFormData = val;
    setFormDataState(val);
  };

  const setPrediction = (val) => {
    memoryPredictionResult = val;
    setPredictionState(val);
  };

  // Filters for "Every Student" view
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score-desc");

  // Load student passed via navigation state (e.g. from CSV tab)
  useEffect(() => {
    if (location.state?.student) {
      const s = location.state.student;
      setSelectedStudentId(String(s.student || s.id || ""));
      setViewMode("particular");
      setFormData({
        study_hours: s.study_hours !== undefined ? String(s.study_hours) : "",
        attendance: s.attendance !== undefined ? String(s.attendance) : "",
        previous_score: s.previous_score !== undefined ? String(s.previous_score) : "",
        assignment_completed: s.assignment_completed !== undefined ? String(s.assignment_completed) : "",
        sleep_hours: s.sleep_hours !== undefined ? String(s.sleep_hours) : "",
        extracurricular: s.extracurricular !== undefined ? String(s.extracurricular) : "0",
      });
      const score = s.final_score !== undefined ? s.final_score : s.predicted_score;
      setPrediction({
        score: score,
        category: s.category || "Good",
        recommendations: getRecommendationsForStudent(s),
      });
    }
  }, [location.state]);

  // Optional: fetch fresh dataset from backend if available
  useEffect(() => {
    const fetchBackendDataset = async () => {
      try {
        const response = await fetch(`${API_URL}/dataset-students`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.students && data.students.length > 0) {
            setDataset(data.students);
          }
        }
      } catch {
        // Fallback to bundled STUDENT_DATASET is already active
      }
    };
    fetchBackendDataset();
  }, []);

  // When a particular student is chosen from dropdown
  const handleStudentSelect = (idStr) => {
    setSelectedStudentId(idStr);
    setErrorMsg("");

    if (!idStr) {
      // Clear to manual
      return;
    }

    const student = dataset.find((s) => String(s.student || s.id) === String(idStr));
    if (student) {
      setFormData({
        study_hours: String(student.study_hours),
        attendance: String(student.attendance),
        previous_score: String(student.previous_score),
        assignment_completed: String(student.assignment_completed),
        sleep_hours: String(student.sleep_hours),
        extracurricular: String(student.extracurricular),
      });

      const score = student.final_score !== undefined ? student.final_score : student.predicted_score;
      const category = student.category;
      const recommendations = getRecommendationsForStudent(student);

      setPrediction({
        score: score,
        category: category,
        recommendations: recommendations,
      });
    }
  };

  // Next student in dataset
  const handleNextStudent = () => {
    const currentIndex = dataset.findIndex((s) => String(s.student || s.id) === String(selectedStudentId));
    if (currentIndex >= 0 && currentIndex < dataset.length - 1) {
      handleStudentSelect(String(dataset[currentIndex + 1].student || dataset[currentIndex + 1].id));
    } else if (currentIndex === -1 && dataset.length > 0) {
      handleStudentSelect(String(dataset[0].student || dataset[0].id));
    }
  };

  // Previous student in dataset
  const handlePrevStudent = () => {
    const currentIndex = dataset.findIndex((s) => String(s.student || s.id) === String(selectedStudentId));
    if (currentIndex > 0) {
      handleStudentSelect(String(dataset[currentIndex - 1].student || dataset[currentIndex - 1].id));
    }
  };

  // Random student from dataset
  const handleRandomStudent = () => {
    if (dataset.length === 0) return;
    const randomIndex = Math.floor(Math.random() * dataset.length);
    handleStudentSelect(String(dataset[randomIndex].student || dataset[randomIndex].id));
  };

  // Clear student selection
  const handleClearStudent = () => {
    setSelectedStudentId("");
    handleReset();
  };

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
      const response = await fetch(`${API_URL}/predict`, {
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
      const recommendations = getRecommendationsForStudent(formData);

      setPrediction({
        score: score,
        category: category,
        recommendations: recommendations,
      });
    } catch (err) {
      console.error("Prediction error:", err);
      // Fallback calculation using linear regression weights so the user still gets results
      const study = Number(formData.study_hours) || 0;
      const att = Number(formData.attendance) || 0;
      const prev = Number(formData.previous_score) || 0;
      const assign = Number(formData.assignment_completed) || 0;
      const sleep = Number(formData.sleep_hours) || 0;
      const extra = Number(formData.extracurricular) || 0;

      // Approximate regression model fallback score
      const fallbackRaw = (att * 0.45) + (prev * 0.35) + (study * 1.5) + (assign * 0.1) + (extra * 1.5) + (sleep * 0.2) - 6;
      const fallbackScore = Number(Math.max(0, Math.min(100, fallbackRaw)).toFixed(1));

      let fallbackCategory = "Average";
      if (fallbackScore >= 80) fallbackCategory = "Excellent";
      else if (fallbackScore >= 60) fallbackCategory = "Good";
      else if (fallbackScore >= 40) fallbackCategory = "Average";
      else fallbackCategory = "Needs Improvement";

      const recommendations = getRecommendationsForStudent(formData);

      setPrediction({
        score: fallbackScore,
        category: fallbackCategory,
        recommendations: recommendations,
      });

      setErrorMsg("Note: Backend server cold-started or offline. Displayed offline ML estimate.");
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
    setSelectedStudentId("");
  };

  // Inspect a student from the "Every Student" table
  const handleInspectStudentFromTable = (student) => {
    setViewMode("particular");
    handleStudentSelect(String(student.student || student.id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compute dataset statistics
  const totalStudents = dataset.length;
  const scores = dataset.map((s) => s.final_score !== undefined ? s.final_score : s.predicted_score);
  const avgScore = (scores.reduce((sum, s) => sum + s, 0) / (totalStudents || 1)).toFixed(1);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const excellentCount = dataset.filter((s) => s.category === "Excellent").length;
  const goodCount = dataset.filter((s) => s.category === "Good").length;
  const averageCount = dataset.filter((s) => s.category === "Average").length;
  const needsImpCount = dataset.filter((s) => s.category === "Needs Improvement").length;

  // Filtered and sorted dataset for "Every Student" table
  const filteredDataset = dataset
    .filter((s) => {
      const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter;
      const query = searchQuery.trim().toLowerCase();
      const studentNum = String(s.student || s.id);
      const scoreStr = String(s.final_score || s.predicted_score);
      const matchesSearch = query === "" || studentNum.includes(query) || scoreStr.includes(query);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const scoreA = a.final_score !== undefined ? a.final_score : a.predicted_score;
      const scoreB = b.final_score !== undefined ? b.final_score : b.predicted_score;
      if (sortBy === "score-desc") return scoreB - scoreA;
      if (sortBy === "score-asc") return scoreA - scoreB;
      if (sortBy === "student-asc") return (a.student || a.id) - (b.student || b.id);
      if (sortBy === "study-desc") return b.study_hours - a.study_hours;
      if (sortBy === "attendance-desc") return b.attendance - a.attendance;
      return 0;
    });

  const selectedStudentObj = dataset.find((s) => String(s.student || s.id) === String(selectedStudentId));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎯 Student Performance Prediction</h1>
        <p className="subtitle">
          Explore individual student metrics from the CSV dataset, predict custom student performance, or view scores across every student in the cohort.
        </p>
      </div>

      {/* View Mode Selector: Particular Student vs Every Student */}
      <div className="view-mode-card">
        <div className="view-mode-header">
          <div className="view-mode-info">
            <span className="view-mode-tag">CSV Dataset Navigation</span>
            <h3>Select Dataset View</h3>
            <p>
              Switch between <strong>Particular Student</strong> (detailed indicators & predictor) and <strong>Every Student</strong> (cohort scores overview).
            </p>
          </div>

          <div className="view-mode-controls">
            {/* View Mode Dropdown */}
            <div className="view-dropdown-container">
              <label htmlFor="viewModeDropdown" className="control-label">
                Display Option:
              </label>
              <select
                id="viewModeDropdown"
                className="mode-select-dropdown"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value="particular">👤 Particular Student (Detailed Data & Predictor)</option>
                <option value="all">👥 Every Student (All Cohort Scores)</option>
              </select>
            </div>

            {/* Quick Toggle Tabs */}
            <div className="view-mode-tabs" role="tablist">
              <button
                type="button"
                className={`tab-btn ${viewMode === "particular" ? "active" : ""}`}
                onClick={() => setViewMode("particular")}
                role="tab"
                aria-selected={viewMode === "particular"}
              >
                👤 Particular Student
              </button>
              <button
                type="button"
                className={`tab-btn ${viewMode === "all" ? "active" : ""}`}
                onClick={() => setViewMode("all")}
                role="tab"
                aria-selected={viewMode === "all"}
              >
                👥 Every Student ({dataset.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MODE 1: PARTICULAR STUDENT (Dropdown + Form + Result)
         ==================================================================== */}
      {viewMode === "particular" && (
        <>
          {/* CSV Dataset Particular Student Dropdown Bar */}
          <div className="student-selector-card">
            <div className="student-dropdown-header">
              <div>
                <span className="selector-eyebrow">CSV DATASET EXPLORER</span>
                <h2>Particular Student Selection</h2>
                <p className="selector-desc">
                  Select any student from the CSV dataset to instantly inspect their metrics and calculate their performance score.
                </p>
              </div>
              {selectedStudentObj && (
                <span className={`badge badge-${selectedStudentObj.category.toLowerCase().replace(/\s+/g, "-")}`}>
                  Student #{selectedStudentObj.student || selectedStudentObj.id} • {selectedStudentObj.category}
                </span>
              )}
            </div>

            <div className="student-dropdown-row">
              <div className="dropdown-input-wrapper">
                <label htmlFor="studentSelect" className="control-label">
                  Choose Particular Student:
                </label>
                <select
                  id="studentSelect"
                  className="student-main-select"
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                >
                  <option value="">✍️ Manual Entry (Custom Student Details)</option>
                  {dataset.map((s) => (
                    <option key={s.id} value={s.student || s.id}>
                      Student {s.student || s.id} — Score: {s.final_score !== undefined ? s.final_score : s.predicted_score} | {s.category} (Study: {s.study_hours}h, Att: {s.attendance}%, Prev: {s.previous_score})
                    </option>
                  ))}
                </select>
              </div>

              <div className="student-stepper-btns">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={handlePrevStudent}
                  disabled={!selectedStudentId || Number(selectedStudentId) <= 1}
                  title="Previous student in CSV set"
                >
                  ◀ Prev
                </button>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={handleNextStudent}
                  disabled={!selectedStudentId || Number(selectedStudentId) >= dataset.length}
                  title="Next student in CSV set"
                >
                  Next ▶
                </button>
                <button
                  type="button"
                  className="stepper-btn-secondary"
                  onClick={handleRandomStudent}
                  title="Pick a random student from CSV"
                >
                  🎲 Random
                </button>
                {selectedStudentId && (
                  <button
                    type="button"
                    className="stepper-btn-clear"
                    onClick={handleClearStudent}
                    title="Clear student and enter custom values"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {selectedStudentObj && (
              <div className="loaded-student-banner">
                <div className="loaded-student-icon">📋</div>
                <div className="loaded-student-text">
                  <strong>Currently Viewing: Student #{selectedStudentObj.student || selectedStudentObj.id} from CSV Dataset</strong>
                  <span>
                    Study: <strong>{selectedStudentObj.study_hours}h</strong> • Attendance: <strong>{selectedStudentObj.attendance}%</strong> • Previous Score: <strong>{selectedStudentObj.previous_score}</strong> • Assignments: <strong>{selectedStudentObj.assignment_completed}%</strong> • Sleep: <strong>{selectedStudentObj.sleep_hours}h</strong> • Extracurricular: <strong>{selectedStudentObj.extracurricular === 1 ? "Yes" : "No"}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  className="view-all-scores-btn"
                  onClick={() => setViewMode("all")}
                >
                  Show Every Student Scores ➔
                </button>
              </div>
            )}
          </div>

          {/* Student Indicators Form */}
          <div className="card" style={{ marginTop: "20px" }}>
            <div className="form-card-title-row">
              <h2>
                {selectedStudentId
                  ? `Indicators for Student #${selectedStudentId}`
                  : "Enter Student Indicators (or choose from CSV above)"}
              </h2>
              {selectedStudentId && (
                <span className="auto-filled-note">⚡ Auto-filled from CSV</span>
              )}
            </div>

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

          {/* Prediction Result Display */}
          {prediction !== null && (
            <div className="result-card">
              <p className="result-title">
                {selectedStudentId
                  ? `Performance Evaluation: Student #${selectedStudentId}`
                  : "Predicted Final Score"}
              </p>
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
                <button
                  type="button"
                  className="text-action-btn"
                  onClick={() => setViewMode("all")}
                >
                  Compare with Every Student in CSV ➔
                </button>
                <Link to="/history" className="cta-link">
                  View In Prediction History →
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* ====================================================================
          MODE 2: EVERY STUDENT (All Scores Table + Filters)
         ==================================================================== */}
      {viewMode === "all" && (
        <div className="every-students-container">
          {/* Summary KPIs */}
          <div className="analytics" style={{ marginTop: "10px" }}>
            <div className="analytics-grid">
              <div className="analytics-card">
                <span>Total Students</span>
                <strong>{totalStudents}</strong>
              </div>
              <div className="analytics-card">
                <span>Cohort Average</span>
                <strong>{avgScore}</strong>
              </div>
              <div className="analytics-card">
                <span>Highest Score</span>
                <strong>{maxScore}</strong>
              </div>
              <div className="analytics-card">
                <span>Lowest Score</span>
                <strong>{minScore}</strong>
              </div>
            </div>
          </div>

          {/* Table Controls (Search, Category Filter, Sort) */}
          <div className="card" style={{ marginTop: "20px" }}>
            <div className="section-header">
              <div>
                <h2>Every Student Performance Scores ({filteredDataset.length})</h2>
                <p className="section-description">
                  Click any student row or "Inspect Student" to view their full indicators and predict/adjust their results.
                </p>
              </div>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => setViewMode("particular")}
              >
                👤 Switch to Particular Student
              </button>
            </div>

            <div className="table-controls-bar">
              {/* Category Pills */}
              <div className="category-filter-pills">
                <button
                  type="button"
                  className={`cat-pill ${categoryFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setCategoryFilter("ALL")}
                >
                  All ({totalStudents})
                </button>
                <button
                  type="button"
                  className={`cat-pill cat-excellent ${categoryFilter === "Excellent" ? "active" : ""}`}
                  onClick={() => setCategoryFilter("Excellent")}
                >
                  Excellent ({excellentCount})
                </button>
                <button
                  type="button"
                  className={`cat-pill cat-good ${categoryFilter === "Good" ? "active" : ""}`}
                  onClick={() => setCategoryFilter("Good")}
                >
                  Good ({goodCount})
                </button>
                <button
                  type="button"
                  className={`cat-pill cat-average ${categoryFilter === "Average" ? "active" : ""}`}
                  onClick={() => setCategoryFilter("Average")}
                >
                  Average ({averageCount})
                </button>
                {needsImpCount > 0 && (
                  <button
                    type="button"
                    className={`cat-pill cat-needs-improvement ${categoryFilter === "Needs Improvement" ? "active" : ""}`}
                    onClick={() => setCategoryFilter("Needs Improvement")}
                  >
                    Needs Imp ({needsImpCount})
                  </button>
                )}
              </div>

              {/* Search & Sort */}
              <div className="table-search-sort">
                <input
                  type="text"
                  placeholder="Search student # or score..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="table-search-input"
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="table-sort-select"
                >
                  <option value="score-desc">Score: High to Low</option>
                  <option value="score-asc">Score: Low to High</option>
                  <option value="student-asc">Student: #1 to #20</option>
                  <option value="attendance-desc">Attendance: High to Low</option>
                  <option value="study-desc">Study Hours: High to Low</option>
                </select>
              </div>
            </div>

            {/* Every Student Score Table */}
            <div className="csv-table-container">
              <table className="interactive-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th style={{ textAlign: "center" }}>Score</th>
                    <th style={{ textAlign: "center" }}>Category</th>
                    <th style={{ textAlign: "center" }}>Study</th>
                    <th style={{ textAlign: "center" }}>Attendance</th>
                    <th style={{ textAlign: "center" }}>Prev Score</th>
                    <th style={{ textAlign: "center" }}>Assignments</th>
                    <th style={{ textAlign: "center" }}>Sleep</th>
                    <th style={{ textAlign: "center" }}>Activity</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDataset.map((s) => {
                    const score = s.final_score !== undefined ? s.final_score : s.predicted_score;
                    const isSelected = String(selectedStudentId) === String(s.student || s.id);

                    return (
                      <tr
                        key={s.id}
                        className={`table-row-clickable ${isSelected ? "row-selected" : ""}`}
                        onClick={() => handleInspectStudentFromTable(s)}
                        title="Click to view and inspect this student"
                      >
                        <td>
                          <strong>Student {s.student || s.id}</strong>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="table-score">{score}</span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`badge badge-${s.category.toLowerCase().replace(/\s+/g, "-")}`}>
                            {s.category}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>{s.study_hours} hrs</td>
                        <td style={{ textAlign: "center" }}>{s.attendance}%</td>
                        <td style={{ textAlign: "center" }}>{s.previous_score}</td>
                        <td style={{ textAlign: "center" }}>{s.assignment_completed}%</td>
                        <td style={{ textAlign: "center" }}>{s.sleep_hours} hrs</td>
                        <td style={{ textAlign: "center" }}>
                          {s.extracurricular === 1 ? (
                            <span className="activity-yes">Yes</span>
                          ) : (
                            <span className="activity-no">No</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="inspect-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspectStudentFromTable(s);
                            }}
                          >
                            Inspect ➔
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prediction;
