from flask import request, jsonify
from database import get_db_connection


def submit_performance():
    data = request.get_json()

    user_id = data.get("user_id")
    game_name = data.get("game_name")
    score = data.get("score")
    accuracy = data.get("accuracy")
    time_taken = data.get("time_taken")

    if not user_id or not game_name or score is None:
        return jsonify({"error": "user_id, game_name and score are required"}), 400

    connection = get_db_connection()

    try:
        connection.execute(
            """
            INSERT INTO performance_logs (user_id, game_name, score, accuracy, time_taken)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, game_name, score, accuracy, time_taken)
        )

        connection.commit()

        return jsonify({
            "message": "Performance data submitted successfully"
        }), 201

    except Exception:
        return jsonify({
            "error": "Something went wrong while saving performance data"
        }), 400

    finally:
        connection.close()


def get_performance_history(user_id):
    connection = get_db_connection()

    try:
        rows = connection.execute(
            """
            SELECT game_name, score, accuracy, time_taken, logged_at
            FROM performance_logs
            WHERE user_id = ?
            ORDER BY logged_at DESC
            """,
            (user_id,)
        ).fetchall()

        return jsonify({
            "user_id": user_id,
            "performance_history": [dict(row) for row in rows]
        }), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while fetching performance history"
        }), 400

    finally:
        connection.close()


def set_difficulty():
    data = request.get_json()

    user_id = data.get("user_id")
    game_name = data.get("game_name")
    difficulty_level = data.get("difficulty_level")

    if not user_id or not game_name or not difficulty_level:
        return jsonify({"error": "user_id, game_name and difficulty_level are required"}), 400

    if difficulty_level not in ("Easy", "Medium", "Hard"):
        return jsonify({"error": "difficulty_level must be Easy, Medium or Hard"}), 400

    connection = get_db_connection()

    try:
        existing = connection.execute(
            """
            SELECT id FROM difficulty_settings
            WHERE user_id = ? AND game_name = ?
            """,
            (user_id, game_name)
        ).fetchone()

        if existing:
            connection.execute(
                """
                UPDATE difficulty_settings
                SET difficulty_level = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND game_name = ?
                """,
                (difficulty_level, user_id, game_name)
            )
        else:
            connection.execute(
                """
                INSERT INTO difficulty_settings (user_id, game_name, difficulty_level)
                VALUES (?, ?, ?)
                """,
                (user_id, game_name, difficulty_level)
            )

        connection.commit()

        return jsonify({
            "message": "Difficulty level set successfully",
            "difficulty_level": difficulty_level
        }), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while setting difficulty"
        }), 400

    finally:
        connection.close()


def get_difficulty(user_id, game_name):
    connection = get_db_connection()

    try:
        row = connection.execute(
            """
            SELECT difficulty_level, updated_at
            FROM difficulty_settings
            WHERE user_id = ? AND game_name = ?
            """,
            (user_id, game_name)
        ).fetchone()

        if not row:
            return jsonify({
                "user_id": user_id,
                "game_name": game_name,
                "difficulty_level": "Medium"
            }), 200

        return jsonify({
            "user_id": user_id,
            "game_name": game_name,
            "difficulty_level": row["difficulty_level"],
            "updated_at": row["updated_at"]
        }), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while fetching difficulty"
        }), 400

    finally:
        connection.close()