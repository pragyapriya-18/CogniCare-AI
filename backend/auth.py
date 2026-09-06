from flask import request, jsonify
from database import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash


def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    language = data.get("language")

    if not name or not email or not password or not role:
        return jsonify({"error": "Please fill all required fields"}), 400

    connection = get_db_connection()

    try:
        hashed_password = generate_password_hash(password)

        connection.execute(
            """
            INSERT INTO users (name, email, password, role, language)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name, email, hashed_password, role, language)
        )

        connection.commit()

        return jsonify({
            "message": "User registered successfully"
        }), 201

    except Exception:
        return jsonify({
            "error": "Email already exists"
        }), 400

    finally:
        connection.close()


def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    connection = get_db_connection()

    try:
        user = connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if user is None:
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        if not check_password_hash(user["password"], password):
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "language": user["language"]
            }
        }), 200

    finally:
        connection.close()