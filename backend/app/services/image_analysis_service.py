import os
import base64
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv("backend/.env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not configured")


client = Groq(
    api_key=GROQ_API_KEY
)


# =========================================================
# IMAGE MEDIA TYPE
# =========================================================

def get_image_media_type(
    image_path: str
) -> str:

    extension = Path(
        image_path
    ).suffix.lower()

    media_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg"
    }

    return media_types.get(
        extension,
        "application/octet-stream"
    )


# =========================================================
# REMOVE THINK BLOCK
# =========================================================

def clean_model_response(
    response: str
) -> str:
    """
    Remove hidden reasoning blocks such as
    <think>...</think> from the model response.
    """

    if not response:
        return ""

    cleaned = response.strip()

    while True:

        lower_text = cleaned.lower()

        start = lower_text.find(
            "<think>"
        )

        if start == -1:
            break

        end = lower_text.find(
            "</think>",
            start
        )

        if end == -1:

            # If an unfinished thinking block is returned,
            # remove the thinking section.
            cleaned = cleaned[:start].strip()
            break

        end += len("</think>")

        cleaned = (
            cleaned[:start]
            + cleaned[end:]
        ).strip()

    return cleaned


# =========================================================
# ANALYZE X-RAY
# =========================================================

def analyze_xray_image(
    image_path: str
) -> str:
    """
    Analyze an X-ray image using a vision-capable
    AI model.

    The result is intended to be an AI-assisted
    descriptive report and not a definitive diagnosis.
    """

    image_file = Path(
        image_path
    )

    if not image_file.exists():

        raise FileNotFoundError(
            f"X-ray image not found: {image_path}"
        )


    # =====================================================
    # READ IMAGE
    # =====================================================

    image_bytes = image_file.read_bytes()

    image_base64 = base64.b64encode(
        image_bytes
    ).decode("utf-8")


    # =====================================================
    # IMAGE MEDIA TYPE
    # =====================================================

    media_type = get_image_media_type(
        image_path
    )


    # =====================================================
    # CREATE BASE64 DATA URL
    # =====================================================

    image_data_url = (
        f"data:{media_type};base64,{image_base64}"
    )


    # =====================================================
    # VISION PROMPT
    # =====================================================

    prompt = """
You are Mediora AI, an AI-assisted medical imaging
information system.

Analyze the provided X-ray image and produce ONLY a
short final report.

DO NOT show reasoning.
DO NOT use <think> tags.
DO NOT describe internal reasoning.
DO NOT repeatedly reconsider the image layout.

Return ONLY these four sections:

IMAGE TYPE

- Identify the anatomical region and visible views.

VISIBLE FINDINGS

- Describe only clearly visible findings.
- Mention bones, alignment, joint spaces, fractures,
  dislocations, obvious abnormalities, soft tissues,
  or hardware only when clearly visible.
- If something cannot be assessed reliably, say so.
- Do not invent measurements.

IMPRESSION

- Give a short summary of observations directly
  supported by the image.
- Do not provide a definitive diagnosis.
- If no reliable abnormality can be established,
  state that clearly.

LIMITATIONS

- Mention image quality, overlapping structures,
  limited views, or other limitations when applicable.

IMPORTANT:

This is AI-assisted image analysis and is NOT a
definitive medical diagnosis.

Do not prescribe medication.
Do not recommend treatment.
Do not invent findings.
Do not invent measurements.
Do not use outside patient information.
Do not use information that cannot be observed
from the supplied image.

Keep the complete response under 500 words.

OUTPUT ONLY THE FINAL REPORT.
"""


    # =====================================================
    # CALL VISION MODEL
    # =====================================================

    response = client.chat.completions.create(

        model="qwen/qwen3.6-27b",

        messages=[
            {
                "role": "user",

                "content": [

                    {
                        "type": "text",
                        "text": prompt
                    },

                    {
                        "type": "image_url",

                        "image_url": {
                            "url": image_data_url
                        }
                    }

                ]
            }
        ],

        temperature=0.1,

        max_tokens=900,

        reasoning_effort="none",

        reasoning_format="hidden"
    )


    # =====================================================
    # GET MODEL RESPONSE
    # =====================================================

    answer = (
        response
        .choices[0]
        .message
        .content
    )


    # =====================================================
    # CLEAN MODEL RESPONSE
    # =====================================================

    answer = clean_model_response(
        answer
    )


    # =====================================================
    # FALLBACK
    # =====================================================

    if not answer:

        answer = (
            "The AI-assisted X-ray analysis did not "
            "produce a usable report."
        )


    # =====================================================
    # RETURN FINAL REPORT
    # =====================================================

    return answer