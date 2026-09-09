import pandas as pd
from sklearn.tree import DecisionTreeClassifier


# Training data for adaptive difficulty
data = {
    "accuracy": [
        10, 20, 30, 40, 45,
        50, 55, 60, 65, 70, 75,
        80, 85, 90, 95, 100
    ],

    "score": [
        10, 20, 30, 40, 45,
        50, 55, 60, 65, 70, 75,
        80, 85, 90, 95, 100
    ],

    "time_taken": [
        8, 7, 6, 5, 5,
        5, 4.5, 4, 4, 3.5, 3.5,
        3, 3, 2.5, 2, 1.5
    ],

    "difficulty": [
        "Easy",
        "Easy",
        "Easy",
        "Easy",
        "Easy",

        "Easy",
        "Easy",
        "Medium",
        "Medium",
        "Medium",
        "Medium",

        "Medium",
        "Hard",
        "Hard",
        "Hard",
        "Hard"
    ]
}

df = pd.DataFrame(data)


# Features used by the model
X = df[["accuracy", "score"]]

# Target: difficulty level
y = df["difficulty"]


# Train the Decision Tree model
model = DecisionTreeClassifier(
    random_state=42,
    max_depth=4
)

model.fit(X, y)


def predict_difficulty(accuracy, score, time_taken):
    """
    Predict the next difficulty level based on player performance.
    """

    prediction = model.predict(
    [[accuracy, score]]
)

    return prediction[0]