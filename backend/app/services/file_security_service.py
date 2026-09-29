from pathlib import Path
import subprocess

from PIL import Image


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

CLAMSCAN_PATH = r"C:\Program Files\ClamAV\clamscan.exe"

# Explicitly tell ClamAV where the virus database is located.
CLAMAV_DATABASE_PATH = (
    r"C:\Users\deept\OneDrive\Desktop"
    r"\Semantic-Multimodal-Medical-AI"
    r"\backend\clamav_database"
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg"
}


# ---------------------------------------------------------
# File extension validation
# ---------------------------------------------------------

def validate_file_extension(filename: str) -> None:

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:

        raise ValueError(
            "Unsupported file type. "
            "Only PDF, PNG, JPG and JPEG files are allowed."
        )


# ---------------------------------------------------------
# File size validation
# ---------------------------------------------------------

def validate_file_size(file_size: int) -> None:

    if file_size <= 0:

        raise ValueError(
            "The uploaded file is empty."
        )

    if file_size > MAX_FILE_SIZE:

        raise ValueError(
            "File is too large. Maximum allowed size is 10 MB."
        )


# ---------------------------------------------------------
# File signature / magic-byte validation
# ---------------------------------------------------------

def validate_file_signature(
    file_path: str,
    filename: str
) -> None:

    extension = Path(filename).suffix.lower()

    with open(file_path, "rb") as file:

        header = file.read(16)

    # PDF
    if extension == ".pdf":

        if not header.startswith(b"%PDF"):

            raise ValueError(
                "The uploaded file is not a valid PDF."
            )

    # JPEG
    elif extension in {".jpg", ".jpeg"}:

        if not header.startswith(b"\xff\xd8\xff"):

            raise ValueError(
                "The uploaded file is not a valid JPEG image."
            )

    # PNG
    elif extension == ".png":

        if not header.startswith(
            b"\x89PNG\r\n\x1a\n"
        ):

            raise ValueError(
                "The uploaded file is not a valid PNG image."
            )


# ---------------------------------------------------------
# Image validation
# ---------------------------------------------------------

def validate_image(file_path: str) -> None:

    try:

        with Image.open(file_path) as image:

            image.verify()

    except Exception as error:

        raise ValueError(
            "The uploaded image is corrupted or invalid."
        ) from error


# ---------------------------------------------------------
# ClamAV malware scan
# ---------------------------------------------------------

def scan_file_for_malware(file_path: str) -> None:

    """
    Scan the uploaded file using ClamAV.

    Return codes:

        0 = no malware detected
        1 = malware detected
        2 = scanning error
    """

    clamav_path = Path(CLAMSCAN_PATH)

    database_path = Path(CLAMAV_DATABASE_PATH)


    # -----------------------------------------------------
    # Check ClamAV executable
    # -----------------------------------------------------

    if not clamav_path.exists():

        raise RuntimeError(
            "ClamAV scanner is not installed correctly."
        )


    # -----------------------------------------------------
    # Check ClamAV database
    # -----------------------------------------------------

    if not database_path.exists():

        raise RuntimeError(
            "ClamAV virus database was not found."
        )


    # -----------------------------------------------------
    # Run ClamAV
    # -----------------------------------------------------

    try:

        result = subprocess.run(

            [
                str(clamav_path),

                "--database=" + str(database_path),

                "--no-summary",

                file_path
            ],

            capture_output=True,

            text=True,

            timeout=120
        )

    except subprocess.TimeoutExpired as error:

        raise RuntimeError(
            "The antivirus scan timed out."
        ) from error

    except Exception as error:

        raise RuntimeError(
            f"Unable to start ClamAV scanner: {error}"
        ) from error


    # -----------------------------------------------------
    # No malware detected
    # -----------------------------------------------------

    if result.returncode == 0:

        return


    # -----------------------------------------------------
    # Malware detected
    # -----------------------------------------------------

    if result.returncode == 1:

        raise ValueError(
            "Malware was detected in the uploaded file. "
            "The upload has been blocked."
        )


    # -----------------------------------------------------
    # ClamAV error
    # -----------------------------------------------------

    error_message = (

        result.stderr.strip()

        or result.stdout.strip()

        or "Unknown ClamAV scanning error."
    )


    raise RuntimeError(

        "Antivirus scan could not be completed: "

        f"{error_message}"
    )


# ---------------------------------------------------------
# Complete security check
# ---------------------------------------------------------

def validate_and_scan_file(
    file_path: str,
    filename: str,
    file_size: int
) -> dict:

    """
    Perform all security checks before medical processing.

    Returns a security result dictionary.
    """

    # -----------------------------------------------------
    # 1. Extension check
    # -----------------------------------------------------

    validate_file_extension(filename)


    # -----------------------------------------------------
    # 2. File size check
    # -----------------------------------------------------

    validate_file_size(file_size)


    # -----------------------------------------------------
    # 3. Magic-byte check
    # -----------------------------------------------------

    validate_file_signature(

        file_path=file_path,

        filename=filename
    )


    # -----------------------------------------------------
    # 4. Image structure check
    # -----------------------------------------------------

    extension = Path(filename).suffix.lower()

    if extension in {".png", ".jpg", ".jpeg"}:

        validate_image(file_path)


    # -----------------------------------------------------
    # 5. Antivirus scan
    # -----------------------------------------------------

    scan_file_for_malware(file_path)


    # -----------------------------------------------------
    # 6. All checks passed
    # -----------------------------------------------------

    return {

        "security_status": "safe",

        "security_message": (
            "Security scan completed. "
            "No malware was detected by ClamAV."
        )
    }