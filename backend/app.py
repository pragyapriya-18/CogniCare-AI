from flask import Flask, request, jsonify
from flask_cors import CORS
from database import create_tables
from auth import register, login
from games import submit_score, get_user_scores
from reminders import create_reminder, get_reminders, update_reminder, delete_reminder
from caregiver import get_patient_info, get_patient_progress
from difficulty import submit_performance, get_performance_history, set_difficulty, get_difficulty, predict_difficulty
from progress import get_progress
from adaptive_model import predict_difficulty

app = Flask(__name__)
CORS(app)

create_tables()


@app.route("/")
def home():
    return "CogniCare-AI Backend is running!"


@app.route("/api/register", methods=["POST"])
def register_user():
    return register()


@app.route("/api/login", methods=["POST"])
def login_user():
    return login()


@app.route("/api/games/submit", methods=["POST"])
def submit_game_score():
    return submit_score()


@app.route("/api/games/scores/<int:user_id>", methods=["GET"])
def fetch_user_scores(user_id):
    return get_user_scores(user_id)


@app.route("/api/reminders", methods=["POST"])
def add_reminder():
    return create_reminder()


@app.route("/api/reminders/<int:user_id>", methods=["GET"])
def fetch_reminders(user_id):
    return get_reminders(user_id)


@app.route("/api/reminders/<int:reminder_id>", methods=["PUT"])
def edit_reminder(reminder_id):
    return update_reminder(reminder_id)


@app.route("/api/reminders/<int:reminder_id>", methods=["DELETE"])
def remove_reminder(reminder_id):
    return delete_reminder(reminder_id)


@app.route("/api/caregiver/patient/<int:patient_id>", methods=["GET"])
def fetch_patient_info(patient_id):
    return get_patient_info(patient_id)


@app.route("/api/caregiver/progress/<int:patient_id>", methods=["GET"])
def fetch_patient_progress(patient_id):
    return get_patient_progress(patient_id)


@app.route("/api/progress/<int:user_id>", methods=["GET"])
def fetch_progress(user_id):
    return get_progress(user_id)


@app.route("/api/difficulty/performance", methods=["POST"])
def log_performance():
    return submit_performance()


@app.route("/api/difficulty/performance/<int:user_id>", methods=["GET"])
def fetch_performance_history(user_id):
    return get_performance_history(user_id)


@app.route("/api/difficulty/set", methods=["POST"])
def update_difficulty():
    return set_difficulty()

@app.route("/api/difficulty/predict", methods=["POST"])
def predict_game_difficulty():
    return predict_difficulty()

@app.route("/api/difficulty/<int:user_id>/<game_name>", methods=["GET"])
def fetch_difficulty(user_id, game_name):
    return get_difficulty(user_id, game_name)


# ---------------- ADAPTIVE AI ----------------

@app.route("/api/difficulty/predict", methods=["POST"])
def predict_next_difficulty():
    data = request.get_json()

    accuracy = data.get("accuracy")
    score = data.get("score")
    time_taken = data.get("time_taken")

    if accuracy is None or score is None or time_taken is None:
        return jsonify({
            "error": "accuracy, score and time_taken are required"
        }), 400

    difficulty = predict_difficulty(
        accuracy,
        score,
        time_taken
    )

    return jsonify({
        "predicted_difficulty": difficulty
    }), 200

# ---------------- RUN SERVER ----------------



if __name__ == "__main__":
    app.run(debug=True)