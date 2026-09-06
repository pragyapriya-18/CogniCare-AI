import sqlite3

def get_db_connection():
    connection = sqlite3.connect("cognicare.db")
    connection.row_factory = sqlite3.Row
    return connection


def create_tables():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            language TEXT
        )
    """)

    connection.commit()
    connection.close()