from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from backend.app.database.connection import get_connection


router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)


# =========================================================
# Request model for doctor availability
# =========================================================

class AvailabilityCreate(BaseModel):
    doctor_id: int
    day_of_week: str
    start_time: str
    end_time: str
    status: str = "Available"

    @field_validator("day_of_week")
    @classmethod
    def validate_day(cls, value):
        allowed_days = {
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        }

        if value not in allowed_days:
            raise ValueError(
                "Invalid day of week."
            )

        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        allowed_statuses = {
            "Available",
            "Busy",
            "Offline"
        }

        if value not in allowed_statuses:
            raise ValueError(
                "Status must be Available, Busy or Offline."
            )

        return value


# =========================================================
# Request model for patient enquiry
# =========================================================

class EnquiryCreate(BaseModel):
    patient_id: int
    doctor_id: int
    question: str

    @field_validator("question")
    @classmethod
    def validate_question(cls, value):
        if not value.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        return value.strip()


# =========================================================
# Request model for doctor response
# =========================================================

class EnquiryResponse(BaseModel):
    doctor_response: str

    @field_validator("doctor_response")
    @classmethod
    def validate_response(cls, value):
        if not value.strip():
            raise ValueError(
                "Doctor response cannot be empty."
            )

        return value.strip()


# =========================================================
# Request model for doctor specialization
# =========================================================

class SpecializationUpdate(BaseModel):
    specialization: str

    @field_validator("specialization")
    @classmethod
    def validate_specialization(cls, value):
        value = value.strip()

        if not value:
            raise ValueError(
                "Specialization cannot be empty."
            )

        return value


# =========================================================
# Get all doctors
# =========================================================

@router.get("/")
def get_doctors():

    connection = get_connection()

    doctors = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            role,
            specialization
        FROM users
        WHERE role = 'doctor'
        ORDER BY name
        """
    ).fetchall()

    connection.close()

    return [
        dict(doctor)
        for doctor in doctors
    ]


# =========================================================
# Update doctor specialization
# =========================================================

@router.put("/{doctor_id}/specialization")
def update_doctor_specialization(
    doctor_id: int,
    specialization_data: SpecializationUpdate
):

    connection = get_connection()

    doctor = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            role,
            specialization
        FROM users
        WHERE id = ?
          AND role = 'doctor'
        """,
        (doctor_id,)
    ).fetchone()

    if doctor is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Doctor not found."
        )

    connection.execute(
        """
        UPDATE users
        SET specialization = ?
        WHERE id = ?
          AND role = 'doctor'
        """,
        (
            specialization_data.specialization,
            doctor_id
        )
    )

    connection.commit()

    updated_doctor = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            role,
            specialization
        FROM users
        WHERE id = ?
          AND role = 'doctor'
        """,
        (doctor_id,)
    ).fetchone()

    connection.close()

    return {
        "message": "Doctor specialization updated successfully.",
        "doctor": dict(updated_doctor)
    }


# =========================================================
# Get available doctors
# =========================================================

@router.get("/available")
def get_available_doctors():

    connection = get_connection()

    doctors = connection.execute(
        """
        SELECT
            da.id AS availability_id,
            u.id AS doctor_id,
            u.name AS doctor_name,
            u.email AS doctor_email,
            u.specialization AS specialization,
            da.day_of_week,
            da.start_time,
            da.end_time,
            da.status
        FROM doctor_availability da
        JOIN users u
            ON da.doctor_id = u.id
        WHERE u.role = 'doctor'
          AND da.status = 'Available'
        ORDER BY
            u.name,
            da.day_of_week,
            da.start_time
        """
    ).fetchall()

    connection.close()

    return [
        dict(doctor)
        for doctor in doctors
    ]


# =========================================================
# Add doctor availability
# =========================================================

@router.post("/availability")
def create_availability(
    availability: AvailabilityCreate
):

    connection = get_connection()

    doctor = connection.execute(
        """
        SELECT
            id,
            name,
            specialization
        FROM users
        WHERE id = ?
          AND role = 'doctor'
        """,
        (availability.doctor_id,)
    ).fetchone()

    if doctor is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Doctor not found."
        )

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO doctor_availability
        (
            doctor_id,
            day_of_week,
            start_time,
            end_time,
            status
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            availability.doctor_id,
            availability.day_of_week,
            availability.start_time,
            availability.end_time,
            availability.status
        )
    )

    connection.commit()

    availability_id = cursor.lastrowid

    connection.close()

    return {
        "message": "Doctor availability added successfully.",
        "availability_id": availability_id,
        "doctor_id": availability.doctor_id,
        "day_of_week": availability.day_of_week,
        "start_time": availability.start_time,
        "end_time": availability.end_time,
        "status": availability.status
    }


# =========================================================
# Get availability for one doctor
# =========================================================

@router.get("/{doctor_id}/availability")
def get_doctor_availability(
    doctor_id: int
):

    connection = get_connection()

    doctor = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            specialization
        FROM users
        WHERE id = ?
          AND role = 'doctor'
        """,
        (doctor_id,)
    ).fetchone()

    if doctor is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Doctor not found."
        )

    availability = connection.execute(
        """
        SELECT
            id,
            doctor_id,
            day_of_week,
            start_time,
            end_time,
            status
        FROM doctor_availability
        WHERE doctor_id = ?
        ORDER BY day_of_week, start_time
        """,
        (doctor_id,)
    ).fetchall()

    connection.close()

    return {
        "doctor": dict(doctor),
        "availability": [
            dict(item)
            for item in availability
        ]
    }


# =========================================================
# Create patient enquiry
# =========================================================

@router.post("/enquiries")
def create_enquiry(
    enquiry: EnquiryCreate
):

    connection = get_connection()

    # -----------------------------------------------------
    # Check patient
    # -----------------------------------------------------

    patient = connection.execute(
        """
        SELECT
            id,
            name
        FROM patients
        WHERE id = ?
        """,
        (enquiry.patient_id,)
    ).fetchone()

    if patient is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Patient not found."
        )

    # -----------------------------------------------------
    # Check doctor
    # -----------------------------------------------------

    doctor = connection.execute(
        """
        SELECT
            id,
            name,
            specialization
        FROM users
        WHERE id = ?
          AND role = 'doctor'
        """,
        (enquiry.doctor_id,)
    ).fetchone()

    if doctor is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Doctor not found."
        )

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO doctor_enquiries
        (
            patient_id,
            doctor_id,
            question,
            status
        )
        VALUES (?, ?, ?, 'Pending')
        """,
        (
            enquiry.patient_id,
            enquiry.doctor_id,
            enquiry.question
        )
    )

    connection.commit()

    enquiry_id = cursor.lastrowid

    connection.close()

    return {
        "message": "Enquiry sent successfully.",
        "enquiry_id": enquiry_id,
        "patient_id": enquiry.patient_id,
        "doctor_id": enquiry.doctor_id,
        "question": enquiry.question,
        "status": "Pending"
    }


# =========================================================
# Get enquiries for a patient
# =========================================================

@router.get("/enquiries/patient/{patient_id}")
def get_patient_enquiries(
    patient_id: int
):

    connection = get_connection()

    patient = connection.execute(
        """
        SELECT
            id,
            name
        FROM patients
        WHERE id = ?
        """,
        (patient_id,)
    ).fetchone()

    if patient is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Patient not found."
        )

    enquiries = connection.execute(
        """
        SELECT
            de.id,
            de.patient_id,
            p.name AS patient_name,
            de.doctor_id,
            u.name AS doctor_name,
            u.email AS doctor_email,
            u.specialization AS doctor_specialization,
            de.question,
            de.status,
            de.doctor_response,
            de.created_at,
            de.responded_at
        FROM doctor_enquiries de
        JOIN patients p
            ON de.patient_id = p.id
        JOIN users u
            ON de.doctor_id = u.id
        WHERE de.patient_id = ?
        ORDER BY de.created_at DESC
        """,
        (patient_id,)
    ).fetchall()

    connection.close()

    return [
        dict(enquiry)
        for enquiry in enquiries
    ]


# =========================================================
# Get enquiries for a doctor
# =========================================================

@router.get("/enquiries/doctor/{doctor_id}")
def get_doctor_enquiries(
    doctor_id: int
):

    connection = get_connection()

    doctor = connection.execute(
        """
        SELECT
            id,
            name,
            specialization
        FROM users
        WHERE id = ?
          AND role = 'doctor'
        """,
        (doctor_id,)
    ).fetchone()

    if doctor is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Doctor not found."
        )

    enquiries = connection.execute(
        """
        SELECT
            de.id,
            de.patient_id,
            p.name AS patient_name,
            p.age AS patient_age,
            p.gender AS patient_gender,
            de.doctor_id,
            u.name AS doctor_name,
            u.specialization AS doctor_specialization,
            de.question,
            de.status,
            de.doctor_response,
            de.created_at,
            de.responded_at
        FROM doctor_enquiries de
        JOIN patients p
            ON de.patient_id = p.id
        JOIN users u
            ON de.doctor_id = u.id
        WHERE de.doctor_id = ?
        ORDER BY
            CASE
                WHEN de.status = 'Pending'
                THEN 0
                ELSE 1
            END,
            de.created_at DESC
        """,
        (doctor_id,)
    ).fetchall()

    connection.close()

    return [
        dict(enquiry)
        for enquiry in enquiries
    ]


# =========================================================
# Doctor responds to enquiry
# =========================================================

@router.put("/enquiries/{enquiry_id}/respond")
def respond_to_enquiry(
    enquiry_id: int,
    response: EnquiryResponse
):

    connection = get_connection()

    enquiry = connection.execute(
        """
        SELECT
            id,
            doctor_id,
            status
        FROM doctor_enquiries
        WHERE id = ?
        """,
        (enquiry_id,)
    ).fetchone()

    if enquiry is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Enquiry not found."
        )

    if enquiry["status"] == "Answered":

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="This enquiry has already been answered."
        )

    connection.execute(
        """
        UPDATE doctor_enquiries
        SET
            doctor_response = ?,
            status = 'Answered',
            responded_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            response.doctor_response,
            enquiry_id
        )
    )

    connection.commit()

    connection.close()

    return {
        "message": "Doctor response submitted successfully.",
        "enquiry_id": enquiry_id,
        "status": "Answered",
        "doctor_response": response.doctor_response
    }