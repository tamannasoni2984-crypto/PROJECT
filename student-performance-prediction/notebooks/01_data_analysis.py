import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score


# =========================
# 1. Load Dataset
# =========================

data = pd.read_csv("dataset/student_data.csv")

print("\nDataset:")
print(data.head())

print("\nDataset Shape:")
print(data.shape)

print("\nDataset Information:")
print(data.info())

print("\nDataset Description:")
print(data.describe())


# =========================
# 2. Data Visualization
# =========================

plt.figure(figsize=(8, 5))

sns.scatterplot(
    x="attendance",
    y="final_score",
    data=data
)

plt.title("Attendance vs Final Score")
plt.xlabel("Attendance")
plt.ylabel("Final Score")

plt.show()


plt.figure(figsize=(8, 5))

sns.heatmap(
    data.corr(numeric_only=True),
    annot=True
)

plt.title("Feature Correlation")

plt.show()


# =========================
# 3. Prepare Data
# =========================

X = data.drop("final_score", axis=1)
y = data["final_score"]


# =========================
# 4. Train/Test Split
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# =========================
# 5. Create Models
# =========================

models = {
    "Linear Regression": LinearRegression(),
    "Decision Tree": DecisionTreeRegressor(
        random_state=42
    ),
    "Random Forest": RandomForestRegressor(
        n_estimators=100,
        random_state=42
    )
}


# =========================
# 6. Train & Compare Models
# =========================

results = {}

for name, model in models.items():

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    r2 = r2_score(
        y_test,
        predictions
    )

    results[name] = {
        "MAE": mae,
        "R2": r2
    }

    print("\n-------------------------")
    print(name)
    print("-------------------------")

    print("MAE:", mae)
    print("R2 Score:", r2)


# =========================
# 7. Display Comparison
# =========================

results_df = pd.DataFrame(results).T

print("\n\nMODEL COMPARISON")
print("=========================")

print(results_df)


# =========================
# 8. Select Best Model
# =========================

best_model_name = results_df["R2"].idxmax()

best_model = models[best_model_name]

print("\nBest Model:")
print(best_model_name)


# =========================
# 9. Save Best Model
# =========================

joblib.dump(
    best_model,
    "model/student_performance_model.pkl"
)

print(
    "\nBest model saved successfully!"
)