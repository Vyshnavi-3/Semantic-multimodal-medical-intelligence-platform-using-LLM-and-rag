from fastapi import APIRouter, HTTPException

from backend.app.database.connection import get_connection
from backend.app.services.report_service import (
    extract_laboratory_results
)
from backend.app.services.report_summary_service import (
    generate_report_summary,
    generate_image_report_summary
)


router = APIRouter(
    prefix="/reports",
    tags=["Medical Reports"]
)


@router.get("/patient/{patient_id}")
def get_patient_report(patient_id: int):

    connection = get_connection()

    patient = connection.execute(
        """
        SELECT
            id,
            name,
            age,
            gender
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
            filename,
            document_type,
            uploaded_at,
            extracted_text,
            image_analysis
        FROM medical_documents
        WHERE patient_id = ?
        ORDER BY uploaded_at DESC
        """,
        (patient_id,)
    ).fetchall()

    connection.close()

    report_documents = []

    for document in documents:

        extracted_text = (
            document["extracted_text"] or ""
        )

        image_analysis = (
            document["image_analysis"] or ""
        )

        laboratory_results = (
            extract_laboratory_results(
                extracted_text
            )
        )

        report_documents.append(
            {
                "document_id": document["id"],
                "filename": document["filename"],
                "document_type": document["document_type"],
                "uploaded_at": document["uploaded_at"],
                "laboratory_results": laboratory_results,
                "image_analysis": image_analysis
            }
        )

    return {
        "patient": dict(patient),
        "document_count": len(documents),
        "documents": report_documents
    }


@router.get("/patient/{patient_id}/summary")
def get_patient_report_summary(patient_id: int):

    connection = get_connection()

    patient = connection.execute(
        """
        SELECT
            id,
            name,
            age,
            gender
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
            filename,
            document_type,
            uploaded_at,
            extracted_text,
            image_analysis
        FROM medical_documents
        WHERE patient_id = ?
        ORDER BY uploaded_at DESC
        """,
        (patient_id,)
    ).fetchall()

    connection.close()

    if not documents:

        return {
            "patient": dict(patient),
            "summary": (
                "I could not find any medical documents "
                "for this patient."
            )
        }

    latest_document = documents[0]

    extracted_text = (
        latest_document["extracted_text"] or ""
    )

    image_analysis = (
        latest_document["image_analysis"] or ""
    )

    laboratory_results = (
        extract_laboratory_results(
            extracted_text
        )
    )

    # ==================================================
    # X-RAY / IMAGE DOCUMENT
    # ==================================================

    if image_analysis.strip():

        summary = generate_image_report_summary(
            patient=dict(patient),
            image_analysis=image_analysis
        )

        return {
            "patient": dict(patient),
            "document_id": latest_document["id"],
            "filename": latest_document["filename"],
            "summary": summary
        }

    # ==================================================
    # LABORATORY DOCUMENT
    # ==================================================

    if not laboratory_results:

        return {
            "patient": dict(patient),
            "document_id": latest_document["id"],
            "filename": latest_document["filename"],
            "summary": (
                "I could not find structured laboratory "
                "results in the latest medical document."
            )
        }

    summary = generate_report_summary(
        patient=dict(patient),
        laboratory_results=laboratory_results
    )

    return {
        "patient": dict(patient),
        "document_id": latest_document["id"],
        "filename": latest_document["filename"],
        "summary": summary
    }