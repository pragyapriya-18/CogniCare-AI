from flask import Flask
from flask_cors import CORS
from database import get_db_connection, create_tables
from auth import register, login
from games import submit_score, get_user_scores
from reminders import create_reminder, get_reminders, update_reminder, delete_reminder
from caregiver import get_patient_info, get_patient_progress
from difficulty import submit_performance, get_performance_history, set_difficulty, get_difficulty
from progress import get_progress

app = Flask(__name__)
CORS(app)

create_tables()


@app.route("/")
def home():
    return "CogniCare-AI Backend is running!"


# ---------------- AUTH ----------------

@app.route("/api/register", methods=["POST"])
def register_user():
    return register()


@app.route("/api/login", methods=["POST"])
def login_user():
    return login()


# ---------------- GAMES ----------------

@app.route("/api/games/submit", methods=["POST"])
def submit_game_score():
    return submit_score()


@app.route("/api/games/scores/<int:user_id>", methods=["GET"])
def fetch_user_scores(user_id):
    return get_user_scores(user_id)


# ---------------- REMINDERS ----------------

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


# ---------------- CAREGIVER ----------------

@app.route("/api/caregiver/patient/<int:patient_id>", methods=["GET"])
def fetch_patient_info(patient_id):
    return get_patient_info(patient_id)


@app.route("/api/caregiver/progress/<int:patient_id>", methods=["GET"])
def fetch_patient_progress(patient_id):
    return get_patient_progress(patient_id)

# ---------------- PROGRESS ----------------

@app.route("/api/progress/<int:user_id>", methods=["GET"])
def fetch_progress(user_id):
    return get_progress(user_id)

# ---------------- AI DIFFICULTY ----------------

@app.route("/api/difficulty/performance", methods=["POST"])
def log_performance():
    return submit_performance()


@app.route("/api/difficulty/performance/<int:user_id>", methods=["GET"])
def fetch_performance_history(user_id):
    return get_performance_history(user_id)


@app.route("/api/difficulty/set", methods=["POST"])
def update_difficulty():
    return set_difficulty()


@app.route("/api/difficulty/<int:user_id>/<game_name>", methods=["GET"])
def fetch_difficulty(user_id, game_name):
    return get_difficulty(user_id, game_name)


# ---------------- RUN SERVER ----------------

if __name__ == "__main__":
    app.run(debug=True)