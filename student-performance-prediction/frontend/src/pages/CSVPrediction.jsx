import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://student-performance-prediction-ic0v.onrender.com";
function CSVPrediction() {
  const [csvResults, setCsvResults] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    setCsvLoading(true);

    try {
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

      setCsvResults(
        data.results.map((item) => ({
          student: item.student,
          predicted_score: item["predicted score"] !== undefined ? item["predicted score"] : item.predicted_score,
          category: item.category,
        }))
      );
    } catch (error) {
      console.error("CSV upload error:", error);
      setErrorMsg("Unable to connect to backend server. Make sure the API is running.");
    } finally {
      setCsvLoading(false);
    }
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📁 Multiple Student Batch Prediction</h1>
        <p className="subtitle">
          Upload a CSV file containing student records to calculate predicted scores and performance categories in bulk.
        </p>
      </div>

      <div className="card">
        <div className="csv-upload-header">
          <div>
            <h2>Upload Student Dataset (.csv)</h2>
            <p className="section-description">
              Ensure your CSV contains columns: <code>study_hours</code>, <code>attendance</code>, <code>previous_score</code>, <code>assignment_completed</code>, <code>sleep_hours</code>, <code>extracurricular</code>.
            </p>
          </div>
          <button type="button" onClick={handleDownloadSample} className="sample-download-btn">
            📥 Download Sample CSV
          </button>
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
              {fileName ? `Selected: ${fileName}` : "Click to select or drop CSV file here"}
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
        <div className="analytics" style={{ marginTop: "30px" }}>
          <h2>Batch Summary</h2>
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
        <div className="card" style={{ marginTop: "30px" }}>
          <div className="section-header">
            <h2>Batch Prediction Results ({csvResults.length})</h2>
          </div>

          <div className="csv-table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th style={{ textAlign: "center" }}>Predicted Score</th>
                  <th style={{ textAlign: "center" }}>Performance Level</th>
                </tr>
              </thead>
              <tbody>
                {csvResults.map((item, index) => (
                  <tr key={item.student || index}>
                    <td>
                      <strong>Student {item.student}</strong>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="table-score">{String(item.predicted_score)}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`badge badge-${item.category.toLowerCase().replace(/\s+/g, "-")}`}>
                        {item.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CSVPrediction;
