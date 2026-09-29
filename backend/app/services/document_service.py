from pathlib import Path
import pymupdf
import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def is_supported_file(filename: str) -> bool:
    supported_extensions = {
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg"
    }

    extension = get_file_extension(filename)

    return extension in supported_extensions


def extract_text_from_pdf(file_path: str) -> str:
    document = pymupdf.open(file_path)

    extracted_text = ""

    for page in document:
        extracted_text += page.get_text()

    document.close()

    return extracted_text
def extract_text_from_image(file_path: str) -> str:
    image = Image.open(file_path)

    extracted_text = pytesseract.image_to_string(image)

    return extracted_text