from flask import jsonify
from database import get_db_connection
from psycopg2.extras import RealDictCursor


def get_patient_info(patient_id):
    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            SELECT id, name, email, role, language
            FROM users
            WHERE id = %s AND role = 'elderly'
            """,
            (patient_id,)
        )

        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Patient not found"}), 404

        return jsonify(dict(row)), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while fetching patient info"
        }), 400

    finally:
        cursor.close()
        connection.close()


def get_patient_progress(patient_id):
    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            SELECT id, name
            FROM users
            WHERE id = %s AND role = 'elderly'
            """,
            (patient_id,)
        )

        patient = cursor.fetchone()

        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        cursor.execute(
            """
            SELECT game_name, score, accuracy, time_taken, played_at
            FROM game_scores
            WHERE user_id = %s
            ORDER BY played_at DESC
            """,
            (patient_id,)
        )

        scores = cursor.fetchall()

        cursor.execute(
            """
            SELECT reminder_type, title, reminder_time, is_active
            FROM reminders
            WHERE user_id = %s
            ORDER BY reminder_time ASC
            """,
            (patient_id,)
        )

        reminders = cursor.fetchall()

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
        cursor.close()
        connection.close()