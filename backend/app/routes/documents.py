from pathlib import Path
import shutil
import uuid

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException
)
from fastapi.responses import FileResponse

from backend.app.database.connection import get_connection

from backend.app.services.document_service import (
    extract_text_from_pdf,
    extract_text_from_image
)

from backend.app.services.rag_service import (
    index_document
)

from backend.app.services.image_analysis_service import (
    analyze_xray_image
)

from backend.app.services.file_security_service import (
    validate_and_scan_file
)


router = APIRouter(
    prefix="/documents",
    tags=["Medical Documents"]
)


# ---------------------------------------------------------
# Directories
# ---------------------------------------------------------

UPLOAD_DIRECTORY = Path("backend/uploads")
QUARANTINE_DIRECTORY = Path("backend/quarantine")

UPLOAD_DIRECTORY.mkdir(
    parents=True,
    exist_ok=True
)

QUARANTINE_DIRECTORY.mkdir(
    parents=True,
    exist_ok=True
)


# ---------------------------------------------------------
# Media type
# ---------------------------------------------------------

def get_media_type(filename: str) -> str:

    extension = Path(filename).suffix.lower()

    media_types = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg"
    }

    return media_types.get(
        extension,
        "application/octet-stream"
    )


# ---------------------------------------------------------
# Upload document
# ---------------------------------------------------------

@router.post("/upload")
async def upload_document(
    patient_id: int = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...)
):

    connection = get_connection()

    # -----------------------------------------------------
    # Check patient
    # -----------------------------------------------------

    patient = connection.execute(
        """
        SELECT id
        FROM patients
        WHERE id = ?
        """,
        (patient_id,)
    ).fetchone()

    if patient is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # -----------------------------------------------------
    # Validate filename
    # -----------------------------------------------------

    filename = file.filename or ""

    if not filename.strip():

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="A valid filename is required."
        )

    extension = Path(filename).suffix.lower()

    allowed_extensions = {
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg"
    }

    if extension not in allowed_extensions:

        connection.close()

        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF, PNG, JPG and JPEG "
                "files are allowed."
            )
        )

    # -----------------------------------------------------
    # Read uploaded file
    # -----------------------------------------------------

    try:

        file_content = await file.read()

    except Exception as error:

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="Could not read the uploaded file."
        ) from error

    file_size = len(file_content)

    # -----------------------------------------------------
    # Create temporary quarantine file
    # -----------------------------------------------------

    unique_filename = (
        f"{uuid.uuid4()}_{filename}"
    )

    quarantine_path = (
        QUARANTINE_DIRECTORY /
        unique_filename
    )

    upload_path = (
        UPLOAD_DIRECTORY /
        unique_filename
    )

    try:

        # -------------------------------------------------
        # Store ONLY in quarantine first
        # -------------------------------------------------

        with open(
            quarantine_path,
            "wb"
        ) as buffer:

            buffer.write(file_content)

        # -------------------------------------------------
        # SECURITY CHECK
        # -------------------------------------------------

        security_result = validate_and_scan_file(
            file_path=str(quarantine_path),
            filename=filename,
            file_size=file_size
        )

        # -------------------------------------------------
        # File is safe
        # Move from quarantine to uploads
        # -------------------------------------------------

        shutil.move(
            str(quarantine_path),
            str(upload_path)
        )

    except ValueError as error:

        # Security validation failed
        if quarantine_path.exists():
            quarantine_path.unlink()

        connection.close()

        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    except RuntimeError as error:

        # Antivirus/security scanner unavailable
        if quarantine_path.exists():
            quarantine_path.unlink()

        connection.close()

        raise HTTPException(
            status_code=503,
            detail=(
                "Security scan could not be completed. "
                "The file was not processed."
            )
        ) from error

    except Exception as error:

        # Unexpected upload/security error
        if quarantine_path.exists():
            quarantine_path.unlink()

        connection.close()

        raise HTTPException(
            status_code=500,
            detail=(
                "The uploaded file could not be processed."
            )
        ) from error

    # -----------------------------------------------------
    # Medical document processing
    # -----------------------------------------------------

    extracted_text = ""

    if extension == ".pdf":

        extracted_text = extract_text_from_pdf(
            str(upload_path)
        )

    elif extension in {
        ".png",
        ".jpg",
        ".jpeg"
    }:

        extracted_text = extract_text_from_image(
            str(upload_path)
        )

    # -----------------------------------------------------
    # X-ray AI analysis
    # -----------------------------------------------------

    image_analysis = ""

    if document_type.strip().lower() == "x-ray image":

        try:

            image_analysis = analyze_xray_image(
                str(upload_path)
            )

        except Exception as error:

            print(
                "X-ray analysis error:",
                error
            )

            image_analysis = (
                "AI-assisted X-ray analysis could not "
                "be completed for this document."
            )

    # -----------------------------------------------------
    # Save document information
    # -----------------------------------------------------

    connection.execute(
        """
        INSERT INTO medical_documents
        (
            patient_id,
            filename,
            document_type,
            file_path,
            extracted_text,
            image_analysis
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            patient_id,
            filename,
            document_type,
            str(upload_path),
            extracted_text,
            image_analysis
        )
    )

    connection.commit()

    document_id = connection.execute(
        "SELECT last_insert_rowid()"
    ).fetchone()[0]

    connection.close()

    # -----------------------------------------------------
    # RAG indexing
    # -----------------------------------------------------

    indexed_chunks = 0

    if extracted_text.strip():

        indexed_chunks = index_document(
            patient_id=patient_id,
            document_id=document_id,
            extracted_text=extracted_text
        )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "message": (
            "Medical document uploaded successfully."
        ),
        "security_status": (
            security_result["security_status"]
        ),
        "security_message": (
            security_result["security_message"]
        ),
        "document_id": document_id,
        "patient_id": patient_id,
        "filename": filename,
        "document_type": document_type,
        "file_path": str(upload_path),
        "indexed_chunks": indexed_chunks,
        "image_analysis_completed": bool(
            image_analysis.strip()
        )
    }


# ---------------------------------------------------------
# Get patient documents
# ---------------------------------------------------------

@router.get("/patient/{patient_id}")
def get_patient_documents(patient_id: int):

    connection = get_connection()

    patient = connection.execute(
        """
        SELECT id
        FROM patients
        WHERE id = ?
        """,
        (patient_id,)
    ).fetchone()

    if patient is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    documents = connection.execute(
        """
        SELECT
            id,
            patient_id,
            filename,
            document_type,
            file_path,
            uploaded_at
        FROM medical_documents
        WHERE patient_id = ?
        ORDER BY uploaded_at DESC
        """,
        (patient_id,)
    ).fetchall()

    connection.close()

    return [
        dict(document)
        for document in documents
    ]


# ---------------------------------------------------------
# View document
# ---------------------------------------------------------

@router.get("/{document_id}/view")
def view_document(document_id: int):

    connection = get_connection()

    document = connection.execute(
        """
        SELECT
            id,
            filename,
            file_path
        FROM medical_documents
        WHERE id = ?
        """,
        (document_id,)
    ).fetchone()

    connection.close()

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    file_path = Path(
        document["file_path"]
    )

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Document file not found on server"
        )

    return FileResponse(
        path=str(file_path),
        media_type=get_media_type(
            document["filename"]
        )
    )


# ---------------------------------------------------------
# Download document
# ---------------------------------------------------------

@router.get("/{document_id}/download")
def download_document(document_id: int):

    connection = get_connection()

    document = connection.execute(
        """
        SELECT
            id,
            filename,
            file_path
        FROM medical_documents
        WHERE id = ?
        """,
        (document_id,)
    ).fetchone()

    connection.close()

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    file_path = Path(
        document["file_path"]
    )

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Document file not found on server"
        )

    return FileResponse(
        path=str(file_path),
        media_type=get_media_type(
            document["filename"]
        ),
        filename=document["filename"]
    )


# ---------------------------------------------------------
# Get single document
# ---------------------------------------------------------

@router.get("/{document_id}")
def get_document(document_id: int):

    connection = get_connection()

    document = connection.execute(
        """
        SELECT
            id,
            patient_id,
            filename,
            document_type,
            file_path,
            uploaded_at,
            extracted_text,
            image_analysis
        FROM medical_documents
        WHERE id = ?
        """,
        (document_id,)
    ).fetchone()

    connection.close()

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return dict(document)