from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import APP_NAME, APP_VERSION

from backend.app.database.models import create_tables
from backend.app.database.connection import (
    create_users_table,
    create_doctor_patient_access_table,
    create_doctor_availability_table,
    create_doctor_enquiries_table
)

from backend.app.routes.reports import router as reports_router
from backend.app.routes.patients import router as patients_router
from backend.app.routes.documents import router as documents_router
from backend.app.routes.chat import router as chat_router
from backend.app.routes.auth import router as auth_router
from backend.app.routes.doctors import router as doctors_router


# --------------------------------------------------
# Create FastAPI application
# --------------------------------------------------

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION
)


# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Security Headers Middleware
# --------------------------------------------------

@app.middleware("http")
async def add_security_headers(request, call_next):

    response = await call_next(request)

    # Prevent browsers from guessing the content type
    response.headers["X-Content-Type-Options"] = "nosniff"

    # Prevent the application from being embedded in frames
    response.headers["X-Frame-Options"] = "DENY"

    # Control how much referrer information is sent
    response.headers[
        "Referrer-Policy"
    ] = "strict-origin-when-cross-origin"

    # Restrict access to browser capabilities
    response.headers[
        "Permissions-Policy"
    ] = (
        "camera=(), "
        "microphone=(), "
        "geolocation=()"
    )

    return response


# --------------------------------------------------
# Create database tables
# --------------------------------------------------

create_tables()
create_users_table()
create_doctor_patient_access_table()
create_doctor_availability_table()
create_doctor_enquiries_table()


# --------------------------------------------------
# Home endpoint
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message": (
            "Semantic Multimodal Medical AI Backend "
            "is running!"
        )
    }


# --------------------------------------------------
# Health check endpoint
# --------------------------------------------------

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": APP_NAME
    }


# --------------------------------------------------
# Register API routes
# --------------------------------------------------

app.include_router(patients_router)

app.include_router(documents_router)

app.include_router(chat_router)

app.include_router(auth_router)

app.include_router(reports_router)

app.include_router(doctors_router)