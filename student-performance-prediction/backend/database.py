import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR,"predictions.db")

print("DATABSE PATH:",DATABASE)
def create_database():
    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute(""" 
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        study_hours REAL,
        attendance REAL,
        previous_score REAL,
        assignment_completed REAL,
        sleep_hours REAL,
        extracurricular INTEGER,
        predicted_score REAL,
        category TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    """)

    connection.commit()
    connection.close()

def save_prediction(
        study_hours,
        attendance,
        previous_score,
        assignment_completed,
        sleep_hours,
        extracurricular,
        predicted_score,
        category
    ):
    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute(""" 
       INSERT INTO predictions(
       study_hours,
       attendance,
       previous_score,
       assignment_completed,
       sleep_hours,
       extracurricular,
       predicted_score,
       category,
       created_at
       )
       VALUES (?,?,?,?,?,?,?,?, datetime('now', 'localtime'))""",
       (
        study_hours,
        attendance,
        previous_score,
        assignment_completed,
        sleep_hours,
        extracurricular,
        predicted_score,
        category
       ))

    connection.commit()
    connection.close()

def get_predictions():
    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute(""" 
      SELECT * 
      FROM predictions
      ORDER BY id DESC 
    """)

    predictions = cursor.fetchall()

    connection.close()

    return predictions


def delete_prediction(prediction_id):
  connection = sqlite3.connect(DATABASE)
  cursor = connection.cursor()

  cursor.execute(
    "DELETE FROM predictions WHERE id = ?",
    (prediction_id,)
  )

  connection.commit()
  connection.close()

