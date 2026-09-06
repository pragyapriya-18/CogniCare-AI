from flask import request, jsonify
from database import get_db_connection


def create_reminder():
    data = request.get_json()

    user_id = data.get("user_id")
    reminder_type = data.get("reminder_type")
    title = data.get("title")
    reminder_time = data.get("reminder_time")

    if not user_id or not reminder_type or not title or not reminder_time:
        return jsonify({"error": "user_id, reminder_type, title and reminder_time are required"}), 400

    connection = get_db_connection()

    try:
        connection.execute(
            """
            INSERT INTO reminders (user_id, reminder_type, title, reminder_time)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, reminder_type, title, reminder_time)
        )

        connection.commit()

        return jsonify({
            "message": "Reminder created successfully"
        }), 201

    except Exception:
        return jsonify({
            "error": "Something went wrong while creating the reminder"
        }), 400

    finally:
        connection.close()


def get_reminders(user_id):
    connection = get_db_connection()

    try:
        rows = connection.execute(
            """
            SELECT id, reminder_type, title, reminder_time, is_active
            FROM reminders
            WHERE user_id = ?
            ORDER BY reminder_time ASC
            """,
            (user_id,)
        ).fetchall()

        reminders = [dict(row) for row in rows]

        return jsonify({
            "user_id": user_id,
            "reminders": reminders
        }), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while fetching reminders"
        }), 400

    finally:
        connection.close()


def update_reminder(reminder_id):
    data = request.get_json()

    title = data.get("title")
    reminder_time = data.get("reminder_time")
    is_active = data.get("is_active")

    connection = get_db_connection()

    try:
        existing = connection.execute(
            "SELECT * FROM reminders WHERE id = ?", (reminder_id,)
        ).fetchone()

        if not existing:
            return jsonify({"error": "Reminder not found"}), 404

        connection.execute(
            """
            UPDATE reminders
            SET title = COALESCE(?, title),
                reminder_time = COALESCE(?, reminder_time),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
            """,
            (title, reminder_time, is_active, reminder_id)
        )

        connection.commit()

        return jsonify({
            "message": "Reminder updated successfully"
        }), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while updating the reminder"
        }), 400

    finally:
        connection.close()


def delete_reminder(reminder_id):
    connection = get_db_connection()

    try:
        existing = connection.execute(
            "SELECT * FROM reminders WHERE id = ?", (reminder_id,)
        ).fetchone()

        if not existing:
            return jsonify({"error": "Reminder not found"}), 404

        connection.execute("DELETE FROM reminders WHERE id = ?", (reminder_id,))
        connection.commit()

        return jsonify({
            "message": "Reminder deleted successfully"
        }), 200

    except Exception:
        return jsonify({
            "error": "Something went wrong while deleting the reminder"
        }), 400

    finally:
        connection.close()