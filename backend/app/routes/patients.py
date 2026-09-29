from fastapi import APIRouter
from pydantic import BaseModel, field_validator

from backend.app.database.connection import get_connection


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


class PatientCreate(BaseModel):
    name: str
    age: int | None = None
    gender: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        if not value.strip():
            raise ValueError("Patient name cannot be empty")

        return value.strip()

    @field_validator("age")
    @classmethod
    def validate_age(cls, value):
        if value is not None and value < 0:
            raise ValueError("Age cannot be negative")

        return value


@router.post("/")
def create_patient(patient: PatientCreate):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO patients (name, age, gender)
        VALUES (?, ?, ?)
        """,
        (patient.name, patient.age, patient.gender)
    )

    connection.commit()

    patient_id = cursor.lastrowid

    connection.close()

    return {
        "id": patient_id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "message": "Patient created successfully"
    }


@router.get("/")
def get_patients():
    connection = get_connection()

    patients = connection.execute(
        "SELECT id, name, age, gender, created_at FROM patients"
    ).fetchall()

    connection.close()

    return [dict(patient) for patient in patients]

@router.get("/{patient_id}")
def get_patient(patient_id: int):
    connection = get_connection()

    patient = connection.execute(
        "SELECT id, name, age, gender, created_at FROM patients WHERE id = ?",
        (patient_id,)
    ).fetchone()

    connection.close()

    if patient is None:
        return {
            "message": "Patient not found"
        }

    return dict(patient)