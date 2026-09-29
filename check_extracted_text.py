import sqlite3
from pathlib import Path


DATABASE_PATH = (
    Path("backend")
    / "app"
    / "database"
    / "medical.db"
)


connection = sqlite3.connect(
    DATABASE_PATH
)

connection.row_factory = sqlite3.Row


document = connection.execute(
    """
    SELECT
        id,
        patient_id,
        filename,
        document_type,
        extracted_text
    FROM medical_documents
    WHERE filename = ?
    ORDER BY id DESC
    LIMIT 1
    """,
    ("OMC Report Sample - Cardio.pdf",)
).fetchone()


if document is None:

    print("PDF document not found.")

else:

    print("=" * 70)
    print("DOCUMENT")
    print("=" * 70)

    print("Document ID:", document["id"])
    print("Patient ID:", document["patient_id"])
    print("Filename:", document["filename"])
    print("Document Type:", document["document_type"])

    print()
    print("=" * 70)
    print("EXTRACTED TEXT")
    print("=" * 70)

    print(
        document["extracted_text"] or
        "[NO EXTRACTED TEXT]"
    )


connection.close()