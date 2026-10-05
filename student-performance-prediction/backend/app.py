# from app import input_data
# from app import prediction
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from database import create_database, save_prediction, get_predictions, delete_prediction

app = Flask(__name__)
CORS(app)

create_database()

# Load the trained ML model
model = joblib.load("model/student_performance_model.pkl")

@app.route("/")
def home():
    return "Student Performance Prediction API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    study_hours = data["study_hours"]
    attendance = data["attendance"]
    previous_score = data["previous_score"]
    assignment_completed = data["assignment_completed"]
    sleep_hours = data["sleep_hours"]
    extracurricular = data["extracurricular"]

    input_data = pd.DataFrame([{
    "study_hours": study_hours,
    "attendance": attendance,
    "previous_score": previous_score,
    "assignment_completed": assignment_completed,
    "sleep_hours": sleep_hours,
    "extracurricular": extracurricular
}])

    prediction = model.predict(input_data)
    
    predicted_score = round(max(0, min(100, float(prediction[0]))),2)

    if predicted_score >= 80:
        category = "Excellent"
    elif predicted_score >= 60:
        category = "Good"
    elif predicted_score >=40:
        category = "Average"
    else:
        category = "Needs Improvement"

    save_prediction(
        study_hours,
        attendance,
        previous_score,
        assignment_completed,
        sleep_hours,
        extracurricular,
        predicted_score,
        category    
    )

    return jsonify({
        "predicted_score": predicted_score,
        "category": category
    })


@app.route("/predictions", methods=["GET"])
def predictions():
    predictions = get_predictions()

    result = []

    for prediction in predictions:
        result.append({
            "id": prediction[0],
            "study_hours": prediction[1],
            "attendance": prediction[2],
            "previous_score": prediction[3],
            "assignment_completed": prediction[4],
            "sleep_hours": prediction[5],
            "extracurricular": prediction[6],
            "predicted_score": prediction[7],
            "category": prediction[8],
            "created_at": prediction[9]
        })
        
    return jsonify(result)

@app.route("/predictions/<int:prediction_id>", methods=["DELETE"])
def delete_prediction_route(prediction_id):
    delete_prediction(prediction_id)

    return jsonify({
        "message": "Prediction deleted successfully"
    })

@app.route("/model-comparison",methods=["GET"])
def model_comparison():

    comparison = {
        "Linear Regression": {
            "MAE": 0.743618,
            "R2": 0.996591
        },
        "Decision Tree": {
            "MAE": 2.1175,
            "R2": 0.963704 
        },
        "Random Forest": {
            "MAE": 2.1175,
            "R2": 0.978229
        }
    }

    return jsonify(comparison)

@app.route("/predict-csv", methods=["POST"])
def predict_csv():

    if "file" not in request.files:
        return jsonify({
            "error": "No CSV file uploaded"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "error": "No file selected"
        }), 400
    try:
        data = pd.read_csv(file)
        
        # Clean column names
        data.columns = data.columns.str.strip().str.lower()

        required_columns = [
            "study_hours",
            "attendance",
            "previous_score",
            "assignment_completed",
            "sleep_hours",
            "extracurricular"
        ]

        missing_columns = [
            column
            for column in required_columns
            if column not in data.columns
        ]

        if missing_columns:
            return jsonify({
                "error": "Missing columns",
                "columns": missing_columns
            }), 400

        input_data = data[required_columns]

        predictions = model.predict(input_data)

        results = []

        for index, prediction in enumerate(predictions):

            predicted_score = round(max(0, min(100, float(prediction))),2)

            if predicted_score >= 80:
                category = "Excellent"
            elif predicted_score >= 60:
                category = "Good"
            elif predicted_score >= 40:
                category = "Average"
            else: 
                category = "Needs Improvement"

            results.append({
                "student": index + 1,
                "predicted score": predicted_score,
                "category": category
            })

        return jsonify({
            "total_students": len(results),
            "results": results
        })
    
    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)