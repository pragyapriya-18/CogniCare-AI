from flask import jsonify
from database import get_db_connection


def get_progress(user_id):
    connection = get_db_connection()

    try:
        user = connection.execute(
            "SELECT id, name, email FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()

        if user is None:
            return jsonify({"error": "User not found"}), 404

        progress = connection.execute(
            """
            SELECT
                COUNT(*) AS games_played,
                COALESCE(AVG(score), 0) AS average_score,
                COALESCE(MAX(score), 0) AS best_score,
                COALESCE(AVG(accuracy), 0) AS average_accuracy,
                COALESCE(SUM(time_taken), 0) AS total_time
            FROM game_scores
            WHERE user_id = ?
            """,
            (user_id,)
        ).fetchone()

        return jsonify({
            "user": dict(user),
            "progress": dict(progress)
        }), 200

    finally:
        connection.close()