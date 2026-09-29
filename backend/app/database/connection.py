import sqlite3
from pathlib import Path


# =========================================================
# DATABASE PATH
# =========================================================

DATABASE_PATH = Path(__file__).resolve().parent / "medical.db"


# =========================================================
# GET DATABASE CONNECTION
# =========================================================

def get_connection():
    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.execute(
        "PRAGMA foreign_keys = ON"
    )

    connection.row_factory = sqlite3.Row

    return connection


# =========================================================
# CREATE / UPDATE USERS TABLE
# =========================================================

def create_users_table():
    """
    Create the users table.

    If an older users table already exists,
    add the missing columns without deleting
    existing user data.
    """

    connection = get_connection()

    # -----------------------------------------------------
    # Check whether users table already exists
    # -----------------------------------------------------

    table_exists = connection.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = 'users'
        """
    ).fetchone()

    # -----------------------------------------------------
    # Create table if it does not exist
    # -----------------------------------------------------

    if table_exists is None:

        connection.execute(
            """
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                name TEXT NOT NULL,

                email TEXT NOT NULL UNIQUE,

                password TEXT NOT NULL,

                role TEXT NOT NULL
                    CHECK(role IN ('doctor', 'patient')),

                patient_id INTEGER,

                created_at DATETIME
                    DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (patient_id)
                    REFERENCES patients(id)
            )
            """
        )

    else:

        # -------------------------------------------------
        # Get existing columns
        # -------------------------------------------------

        columns = connection.execute(
            """
            PRAGMA table_info(users)
            """
        ).fetchall()

        existing_columns = {
            column["name"]
            for column in columns
        }

        # -------------------------------------------------
        # Add role column if missing
        # -------------------------------------------------

        if "role" not in existing_columns:

            connection.execute(
                """
                ALTER TABLE users
                ADD COLUMN role TEXT
                """
            )

            # Existing users are not assigned a role yet.
            # They can be updated later through the
            # authentication setup.

        # -------------------------------------------------
        # Add patient_id column if missing
        # -------------------------------------------------

        if "patient_id" not in existing_columns:

            connection.execute(
                """
                ALTER TABLE users
                ADD COLUMN patient_id INTEGER
                """
            )

        # -------------------------------------------------
        # Add created_at column if missing
        # -------------------------------------------------

        if "created_at" not in existing_columns:

            connection.execute(
                """
                ALTER TABLE users
                ADD COLUMN created_at DATETIME
                """
            )

            connection.execute(
                """
                UPDATE users
                SET created_at = CURRENT_TIMESTAMP
                WHERE created_at IS NULL
                """
            )
                # -------------------------------------------------
        # Add specialization column if missing
        # -------------------------------------------------

        if "specialization" not in existing_columns:

            connection.execute(
                """
                ALTER TABLE users
                ADD COLUMN specialization TEXT
                """
            )

    connection.commit()

    connection.close()


# =========================================================
# CREATE DOCTOR-PATIENT ACCESS TABLE
# =========================================================

def create_doctor_patient_access_table():
    """
    Create the doctor_patient_access table.

    This table defines which doctor can access
    which patient.
    """

    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS doctor_patient_access (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            doctor_id INTEGER NOT NULL,

                            patient_id INTEGER,

                specialization TEXT,

                created_at DATETIME
                    DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (doctor_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY (patient_id)
                REFERENCES patients(id)
                ON DELETE CASCADE,

            UNIQUE (doctor_id, patient_id)
        )
        """
    )

    connection.commit()

    connection.close()
def create_doctor_availability_table():
    """
    Create the doctor_availability table.

    This stores the days and time periods during which
    a doctor is available.
    """

    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS doctor_availability (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doctor_id INTEGER NOT NULL,
            day_of_week TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Available'
                CHECK(status IN ('Available', 'Busy', 'Offline')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doctor_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
        """
    )

    connection.commit()
    connection.close()


def create_doctor_enquiries_table():
    """
    Create the doctor_enquiries table.

    This stores questions sent by patients to doctors
    and the doctor's responses.
    """

    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS doctor_enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending'
                CHECK(status IN ('Pending', 'Answered')),
            doctor_response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            responded_at DATETIME,
            FOREIGN KEY (patient_id)
                REFERENCES patients(id)
                ON DELETE CASCADE,
            FOREIGN KEY (doctor_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
        """
    )

    connection.commit()
    connection.close()