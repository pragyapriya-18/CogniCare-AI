from flask import Flask
from database import get_db_connection, create_tables
from auth import register

app = Flask(__name__)

create_tables()

@app.route("/")
def home():
    return "CogniCare-AI Backend is running!"


@app.route("/api/register", methods=["POST"])
def register_user():
    return register()


if __name__ == "__main__":
    app.run(debug=True)