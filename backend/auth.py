from flask import request, jsonify
from database import get_db_connection


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
        connection.execute(
            """
            INSERT INTO users (name, email, password, role, language)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name, email, password, role, language)
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