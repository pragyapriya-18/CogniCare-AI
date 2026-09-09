from flask import request, jsonify
from database import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash
from psycopg2.extras import RealDictCursor


def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    language = data.get("language")

    if not name or not email or not password or not role:
        return jsonify({
            "error": "Please fill all required fields"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        hashed_password = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO users (name, email, password, role, language)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, name, email, role, language
            """,
            (name, email, hashed_password, role, language)
        )

        user = cursor.fetchone()
        connection.commit()

        return jsonify({
            "message": "User registered successfully",
            "user": dict(user)
        }), 201

    except Exception as e:
        connection.rollback()

        return jsonify({
            "error": "Email already exists"
        }), 400

    finally:
        cursor.close()
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
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            SELECT *
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

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
        cursor.close()
        connection.close()