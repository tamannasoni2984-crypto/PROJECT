🎓 Student Performance Prediction & Analytics

A full-stack web app that predicts a student's final performance score from study habits and classifies it into a performance category. It supports single predictions, bulk CSV uploads, a saved prediction history, and a comparison of the machine learning models that were evaluated.

🔗 Live demo: 
https://student-performance-prediction-app.netlify.app 🔗 API: student-performance-prediction-ic0v.onrender.com

⏳ The backend runs on Render's free plan and sleeps when idle. The first request after a pause can take up to ~50 seconds while it wakes up.

✨ Features
Single prediction: enter a student's details and get a predicted score and category instantly.
Bulk CSV prediction: upload a CSV file and get predictions for every student at once.
Sample CSV download: a ready-made file to try the upload feature.
Prediction history: every single prediction is saved to a database, and entries can be deleted.
Model comparison: compares Linear Regression, Decision Tree, and Random Forest using MAE and R².
Performance categories: scores are grouped into Excellent, Good, Average, or Needs Improvement.
🧠 How It Works

The model takes six input features:

Feature	Description
study_hours	Hours studied
attendance	Attendance percentage
previous_score	Score in the previous exam
assignment_completed	Assignments completed
sleep_hours	Hours of sleep
extracurricular	Extracurricular activity participation

The predicted score is clamped between 0 and 100 and mapped to a category:

Score	Category
80 – 100	Excellent
60 – 79	Good
40 – 59	Average
Below 40	Needs Improvement
Model Comparison
Model	MAE	R²
Linear Regression	0.7436	0.9966
Decision Tree	2.1175	0.9637
Random Forest	2.1175	0.9782
🛠️ Tech Stack
Layer	Technology
Frontend	React, Vite
Backend	Python, Flask, Flask-CORS
Machine Learning	scikit-learn, pandas, joblib
Database	SQLite
Hosting	Netlify (frontend), Render (backend)
📁 Project Structure
PROJECT/
├── netlify.toml
├── README.md
└── student-performance-prediction/
    ├── backend/          # Flask API (app.py, database.py)
    ├── dataset/          # student_data.csv, test_students.csv
    ├── frontend/         # React + Vite app
    ├── model/            # student_performance_model.pkl
    ├── notebooks/        # model training and analysis
    └── requirements.txt
🔌 API Endpoints
Method	Endpoint	Description
GET	/	Health check
POST	/predict	Predict for one student (JSON body)
POST	/predict-csv	Predict for many students (CSV upload, form field file)
GET	/predictions	List saved predictions
DELETE	/predictions/<id>	Delete a saved prediction
GET	/model-comparison	Model evaluation metrics

Example request: POST /predict

json
{
  "study_hours": 6,
  "attendance": 90,
  "previous_score": 75,
  "assignment_completed": 9,
  "sleep_hours": 7,
  "extracurricular": 1
}

Example response

json
{
  "predicted_score": 82.4,
  "category": "Excellent"
}
CSV Format

The uploaded CSV must contain these columns (names are case-insensitive):

study_hours, attendance, previous_score, assignment_completed, sleep_hours, extracurricular
🚀 Run Locally
Prerequisites
Python 3.10+
Node.js 18+
1. Clone the repository
bash
git clone https://github.com/tamannasoni2984-crypto/PROJECT.git
cd PROJECT/student-performance-prediction
2. Start the backend

Run these from the student-performance-prediction folder (the model path is relative to it):

bash
pip install -r requirements.txt
python backend/app.py

The API runs at https://student-performance-prediction-ic0v.onrender.com

3. Start the frontend
bash
cd frontend
npm install
npm run dev

The app runs at http://localhost:5173. To point it at a different backend, create frontend/.env:

VITE_API_URL=
https://student-performance-prediction-ic0v.onrender.com
☁️ Deployment
Frontend (Netlify): builds the React app with npm run build (configured in netlify.toml). Set the environment variable VITE_API_URL to the backend URL.
Backend (Render): Python web service running the Flask app with Gunicorn.
⚠️ Known Limitations
The SQLite database resets when the free Render instance restarts, so prediction history is not permanent.
The free-tier backend has a cold start delay after inactivity.
🔮 Future Improvements
Move prediction history to a hosted database (PostgreSQL) for persistence.
Add charts for individual and class-level performance trends.
Add user authentication.
👩‍💻 Author

Tamanna Soni GitHub: @tamannasoni2984-crypto
