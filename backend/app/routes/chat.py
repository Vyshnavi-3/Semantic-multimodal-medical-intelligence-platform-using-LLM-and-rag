from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from backend.app.services.rag_service import answer_medical_question
from backend.app.database.connection import get_connection


router = APIRouter(
    prefix="/chat",
    tags=["Medical Chat"]
)


class ChatRequest(BaseModel):
    patient_id: int
    question: str

    @field_validator("question")
    @classmethod
    def validate_question(cls, value):
        if not value.strip():
            raise ValueError("Question cannot be empty")

        return value.strip()


@router.post("/")
def chat(request: ChatRequest):

    # --------------------------------------------------
    # 1. Check whether the patient exists
    # --------------------------------------------------

    connection = get_connection()

    patient = connection.execute(
        "SELECT id FROM patients WHERE id = ?",
        (request.patient_id,)
    ).fetchone()

    connection.close()

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # --------------------------------------------------
    # 2. Generate answer using the RAG pipeline
    # --------------------------------------------------

    result = answer_medical_question(
        question=request.question,
        patient_id=request.patient_id,
        number_of_results=5
    )

    # --------------------------------------------------
    # 3. Return answer + source information
    # --------------------------------------------------

    return {
        "patient_id": request.patient_id,
        "question": request.question,
        "answer": result.get(
            "answer",
            "I could not find this information in the provided medical records."
        ),
        "sources": result.get(
            "sources",
            []
        )
    }