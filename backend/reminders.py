from flask import request, jsonify
from database import get_db_connection
from psycopg2.extras import RealDictCursor


def create_reminder():
    data = request.get_json()

    user_id = data.get("user_id")
    reminder_type = data.get("reminder_type")
    title = data.get("title")
    reminder_time = data.get("reminder_time")

    if not user_id or not reminder_type or not title or not reminder_time:
        return jsonify({
            "error": "user_id, reminder_type, title and reminder_time are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            INSERT INTO reminders
            (user_id, reminder_type, title, reminder_time)
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, reminder_type, title, reminder_time)
        )

        connection.commit()

        return jsonify({
            "message": "Reminder created successfully"
        }), 201

    except Exception:
        connection.rollback()

        return jsonify({
            "error": "Something went wrong while creating the reminder"
        }), 400

    finally:
        cursor.close()
        connection.close()


def get_reminders(user_id):
    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            SELECT id, reminder_type, title, reminder_time, is_active
            FROM reminders
            WHERE user_id = %s
            ORDER BY reminder_time ASC
            """,
            (user_id,)
        )

        rows = cursor.fetchall()

        return jsonify({
            "user_id": user_id,
            "reminders": [dict(row) for row in rows]
        }), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while fetching reminders"
        }), 400

    finally:
        cursor.close()
        connection.close()


def update_reminder(reminder_id):
    data = request.get_json()

    title = data.get("title")
    reminder_time = data.get("reminder_time")
    is_active = data.get("is_active")

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            "SELECT * FROM reminders WHERE id = %s",
            (reminder_id,)
        )

        existing = cursor.fetchone()

        if not existing:
            return jsonify({
                "error": "Reminder not found"
            }), 404

        cursor.execute(
            """
            UPDATE reminders
            SET title = COALESCE(%s, title),
                reminder_time = COALESCE(%s, reminder_time),
                is_active = COALESCE(%s, is_active)
            WHERE id = %s
            """,
            (title, reminder_time, is_active, reminder_id)
        )

        connection.commit()

        return jsonify({
            "message": "Reminder updated successfully"
        }), 200

    except Exception:
        connection.rollback()

        return jsonify({
            "error": "Something went wrong while updating the reminder"
        }), 400

    finally:
        cursor.close()
        connection.close()


def delete_reminder(reminder_id):
    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            "SELECT * FROM reminders WHERE id = %s",
            (reminder_id,)
        )

        existing = cursor.fetchone()

        if not existing:
            return jsonify({
                "error": "Reminder not found"
            }), 404

        cursor.execute(
            "DELETE FROM reminders WHERE id = %s",
            (reminder_id,)
        )

        connection.commit()

        return jsonify({
            "message": "Reminder deleted successfully"
        }), 200

    except Exception:
        connection.rollback()

        return jsonify({
            "error": "Something went wrong while deleting the reminder"
        }), 400

    finally:
        cursor.close()
        connection.close()