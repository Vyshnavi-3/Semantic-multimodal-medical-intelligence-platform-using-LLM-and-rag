import hashlib
import secrets
import hmac
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from backend.app.database.connection import get_connection


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# REQUEST MODELS
# =========================================================

class RegisterRequest(BaseModel):

    name: str
    email: str
    password: str
    role: str
    patient_id: int | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):

        value = value.strip()

        if not value:
            raise ValueError(
                "Name cannot be empty"
            )

        return value


    @field_validator("email")
    @classmethod
    def validate_email(cls, value):

        value = value.strip().lower()

        if "@" not in value:
            raise ValueError(
                "Invalid email address"
            )

        return value


    @field_validator("password")
    @classmethod
    def validate_password(cls, value):

        if len(value) < 8:
            raise ValueError(
                "Password must contain at least 8 characters"
            )

        return value


    @field_validator("role")
    @classmethod
    def validate_role(cls, value):

        value = value.strip().lower()

        if value not in {
            "doctor",
            "patient"
        }:
            raise ValueError(
                "Role must be either doctor or patient"
            )

        return value


class LoginRequest(BaseModel):

    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):

        value = value.strip().lower()

        if "@" not in value:
            raise ValueError(
                "Invalid email address"
            )

        return value


    @field_validator("password")
    @classmethod
    def validate_password(cls, value):

        if not value:
            raise ValueError(
                "Password cannot be empty"
            )

        return value


class ForgotPasswordRequest(BaseModel):

    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):

        value = value.strip().lower()

        if "@" not in value:
            raise ValueError(
                "Invalid email address"
            )

        return value


class ResetPasswordRequest(BaseModel):

    email: str
    otp: str
    new_password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):

        value = value.strip().lower()

        if "@" not in value:
            raise ValueError(
                "Invalid email address"
            )

        return value


    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value):

        value = value.strip()

        if len(value) != 6 or not value.isdigit():
            raise ValueError(
                "OTP must contain 6 digits"
            )

        return value


    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value):

        if len(value) < 8:
            raise ValueError(
                "Password must contain at least 8 characters"
            )

        return value


# =========================================================
# PASSWORD FUNCTIONS
# =========================================================

def hash_password(password: str) -> str:

    salt = secrets.token_bytes(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000
    )

    return (
        f"{salt.hex()}:"
        f"{password_hash.hex()}"
    )


def verify_password(
    password: str,
    stored_password: str
) -> bool:

    try:

        salt_hex, stored_hash_hex = (
            stored_password.split(":")
        )

        salt = bytes.fromhex(
            salt_hex
        )

        stored_hash = bytes.fromhex(
            stored_hash_hex
        )

        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            100000
        )

        return hmac.compare_digest(
            password_hash,
            stored_hash
        )

    except (ValueError, TypeError):

        return False


# =========================================================
# PASSWORD RESET TABLE
# =========================================================

def create_password_reset_table():

    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            otp TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            used INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    connection.commit()
    connection.close()


create_password_reset_table()


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register_user(
    request: RegisterRequest
):

    connection = get_connection()

    existing_user = connection.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
        """,
        (request.email,)
    ).fetchone()

    if existing_user is not None:

        connection.close()

        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this email "
                "already exists"
            )
        )


    # -----------------------------------------------------
    # PATIENT VALIDATION
    # -----------------------------------------------------

    if request.role == "patient":

        if request.patient_id is None:

            connection.close()

            raise HTTPException(
                status_code=400,
                detail=(
                    "patient_id is required "
                    "for a patient account"
                )
            )


        patient = connection.execute(
            """
            SELECT id
            FROM patients
            WHERE id = ?
            """,
            (request.patient_id,)
        ).fetchone()


        if patient is None:

            connection.close()

            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )

    else:

        request.patient_id = None


    # -----------------------------------------------------
    # HASH PASSWORD
    # -----------------------------------------------------

    password_hash = hash_password(
        request.password
    )


    # -----------------------------------------------------
    # INSERT USER
    # -----------------------------------------------------

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO users
        (
            name,
            email,
            password,
            role,
            patient_id
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            request.name,
            request.email,
            password_hash,
            request.role,
            request.patient_id
        )
    )


    connection.commit()

    user_id = cursor.lastrowid

    connection.close()


    return {
        "message": "Account created successfully",
        "user_id": user_id,
        "name": request.name,
        "email": request.email,
        "role": request.role,
        "patient_id": request.patient_id
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login_user(
    request: LoginRequest
):

    connection = get_connection()

    user = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            password,
            role,
            patient_id,
            created_at
        FROM users
        WHERE email = ?
        """,
        (request.email,)
    ).fetchone()

    connection.close()


    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    if not verify_password(
        request.password,
        user["password"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    return {
        "message": "Login successful",

        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "patient_id": user["patient_id"]
        }
    }


# =========================================================
# FORGOT PASSWORD
# =========================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest
):

    connection = get_connection()


    user = connection.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
        """,
        (request.email,)
    ).fetchone()


    if user is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail=(
                "No registered account was found "
                "with this email address"
            )
        )


    # -----------------------------------------------------
    # GENERATE 6-DIGIT OTP
    # -----------------------------------------------------

    otp = str(
        secrets.randbelow(900000) + 100000
    )


    expires_at = (
        datetime.now() +
        timedelta(minutes=10)
    )


    # -----------------------------------------------------
    # INVALIDATE PREVIOUS OTPs
    # -----------------------------------------------------

    connection.execute(
        """
        UPDATE password_reset_tokens
        SET used = 1
        WHERE email = ?
          AND used = 0
        """,
        (request.email,)
    )


    # -----------------------------------------------------
    # SAVE NEW OTP
    # -----------------------------------------------------

    connection.execute(
        """
        INSERT INTO password_reset_tokens
        (
            email,
            otp,
            expires_at
        )
        VALUES (?, ?, ?)
        """,
        (
            request.email,
            otp,
            expires_at.isoformat()
        )
    )


    connection.commit()
    connection.close()


    # -----------------------------------------------------
    # DEVELOPMENT RESPONSE
    # -----------------------------------------------------
    # In a real production system, the OTP should be
    # delivered through email/SMS and should NOT be
    # returned by the API.
    # -----------------------------------------------------

    return {
        "message": (
            "Password reset OTP generated successfully"
        ),
        "email": request.email,
        "otp": otp,
        "expires_in_minutes": 10
    }


# =========================================================
# RESET PASSWORD
# =========================================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest
):

    connection = get_connection()


    # -----------------------------------------------------
    # FIND VALID OTP
    # -----------------------------------------------------

    reset_token = connection.execute(
        """
        SELECT
            id,
            otp,
            expires_at,
            used
        FROM password_reset_tokens
        WHERE email = ?
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (request.email,)
    ).fetchone()


    if reset_token is None:

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="No password reset request found"
        )


    if reset_token["used"] == 1:

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="This OTP has already been used"
        )


    # -----------------------------------------------------
    # CHECK OTP
    # -----------------------------------------------------

    if not hmac.compare_digest(
        request.otp,
        reset_token["otp"]
    ):

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )


    # -----------------------------------------------------
    # CHECK EXPIRATION
    # -----------------------------------------------------

    expires_at = datetime.fromisoformat(
        reset_token["expires_at"]
    )


    if datetime.now() > expires_at:

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="OTP has expired"
        )


    # -----------------------------------------------------
    # HASH NEW PASSWORD
    # -----------------------------------------------------

    new_password_hash = hash_password(
        request.new_password
    )


    # -----------------------------------------------------
    # UPDATE USER PASSWORD
    # -----------------------------------------------------

    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE users
        SET password = ?
        WHERE email = ?
        """,
        (
            new_password_hash,
            request.email
        )
    )


    if cursor.rowcount == 0:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="User account not found"
        )


    # -----------------------------------------------------
    # MARK OTP AS USED
    # -----------------------------------------------------

    connection.execute(
        """
        UPDATE password_reset_tokens
        SET used = 1
        WHERE id = ?
        """,
        (reset_token["id"],)
    )


    connection.commit()
    connection.close()


    return {
        "message": (
            "Password reset successfully"
        )
    }