from flask import request, jsonify
from database import get_db_connection


def submit_score():
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
            INSERT INTO game_scores (user_id, game_name, score, accuracy, time_taken)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, game_name, score, accuracy, time_taken)
        )

        connection.commit()

        return jsonify({
            "message": "Score submitted successfully"
        }), 201

    except Exception:
        return jsonify({
            "error": "Something went wrong while saving the score"
        }), 400

    finally:
        connection.close()


def get_user_scores(user_id):
    connection = get_db_connection()

    try:
        rows = connection.execute(
            """
            SELECT id, game_name, score, accuracy, time_taken, played_at
            FROM game_scores
            WHERE user_id = ?
            ORDER BY played_at DESC
            """,
            (user_id,)
        ).fetchall()

        scores = [dict(row) for row in rows]

        return jsonify({
            "user_id": user_id,
            "scores": scores
        }), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while fetching scores"
        }), 400

    finally:
        connection.close()