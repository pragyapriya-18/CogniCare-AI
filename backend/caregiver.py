from flask import jsonify
from database import get_db_connection


def get_patient_info(patient_id):
    connection = get_db_connection()

    try:
        row = connection.execute(
            """
            SELECT id, name, email, role, language
            FROM users
            WHERE id = ? AND role = 'elderly'
            """,
            (patient_id,)
        ).fetchone()

        if not row:
            return jsonify({"error": "Patient not found"}), 404

        return jsonify(dict(row)), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while fetching patient info"
        }), 400

    finally:
        connection.close()


def get_patient_progress(patient_id):
    connection = get_db_connection()

    try:
        patient = connection.execute(
            "SELECT id, name FROM users WHERE id = ? AND role = 'elderly'",
            (patient_id,)
        ).fetchone()

        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        scores = connection.execute(
            """
            SELECT game_name, score, accuracy, time_taken, played_at
            FROM game_scores
            WHERE user_id = ?
            ORDER BY played_at DESC
            """,
            (patient_id,)
        ).fetchall()

        reminders = connection.execute(
            """
            SELECT reminder_type, title, reminder_time, is_active
            FROM reminders
            WHERE user_id = ?
            ORDER BY reminder_time ASC
            """,
            (patient_id,)
        ).fetchall()

        return jsonify({
            "patient_id": patient_id,
            "patient_name": patient["name"],
            "scores": [dict(row) for row in scores],
            "reminders": [dict(row) for row in reminders]
        }), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while fetching patient progress"
        }), 400

    finally:
        connection.close()