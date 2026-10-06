import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://student-performance-prediction-ic0v.onrender.com";
function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/predictions`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching prediction history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/predictions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete prediction");
        return;
      }

      setHistory((prevHistory) => prevHistory.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting prediction:", error);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesCategory =
      filterCategory === "ALL" ||
      item.category?.toLowerCase() === filterCategory.toLowerCase();

    const matchesSearch =
      searchTerm === "" ||
      item.predicted_score?.toString().includes(searchTerm) ||
      item.created_at?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🕒 Prediction History</h1>
        <p className="subtitle">
          Complete historical record of all individual student performance predictions saved in the database.
        </p>
      </div>

      <div className="history-controls-card">
        <div className="history-filters">
          <div className="filter-group">
            <label>Filter by Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Categories ({history.length})</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Needs Improvement">Needs Improvement</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search score or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading history records...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="history-list">
          {filteredHistory.map((item) => (
            <div className="history-card" key={item.id}>
              <div className="history-info">
                <div className="history-card-header">
                  <strong>Record #{item.id}</strong>
                  <span className="history-timestamp">{item.created_at || "Recorded"}</span>
                </div>

                <div className="history-details">
                  <span>
                    <strong>Study:</strong> {item.study_hours} hrs/day
                  </span>
                  <span>
                    <strong>Attendance:</strong> {item.attendance}%
                  </span>
                  <span>
                    <strong>Previous Score:</strong> {item.previous_score}
                  </span>
                  <span>
                    <strong>Assignments:</strong> {item.assignment_completed}%
                  </span>
                  <span>
                    <strong>Sleep:</strong> {item.sleep_hours} hrs/day
                  </span>
                  <span>
                    <strong>Extracurricular:</strong>{" "}
                    {item.extracurricular === 1 ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="history-right-col">
                <div className="history-score">
                  <strong>{item.predicted_score}</strong>
                  <span className={`badge badge-${item.category?.toLowerCase().replace(/\s+/g, "-")}`}>
                    {item.category}
                  </span>
                </div>

                <button
                  onClick={() => setDeleteId(item.id)}
                  className="delete-button"
                  title="Delete this record"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-icon">📂</div>
          <h3>{history.length === 0 ? "No Predictions in Database" : "No Matching Records Found"}</h3>
          <p>
            {history.length === 0
              ? "Predictions made through the single student predictor are permanently stored here."
              : "Try adjusting your filter or search query."}
          </p>
          {history.length === 0 && (
            <Link to="/prediction" className="primary-btn" style={{ maxWidth: "240px", margin: "20px auto 0" }}>
              Make a Prediction
            </Link>
          )}
        </div>
      )}

      {deleteId !== null && (
        <div className="delete-popup-overlay">
          <div className="delete-popup">
            <div className="popup-icon">⚠️</div>
            <h3>Delete Prediction Record?</h3>
            <p>Are you sure you want to delete this prediction? This action cannot be undone.</p>

            <div className="delete-popup-buttons">
              <button onClick={() => setDeleteId(null)} className="cancel-button">
                Cancel
              </button>

              <button
                onClick={() => {
                  handleDelete(deleteId);
                  setDeleteId(null);
                }}
                className="confirm-delete-button"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionHistory;
