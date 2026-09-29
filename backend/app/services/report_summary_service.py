import os

from dotenv import load_dotenv
from groq import Groq


# Load environment variables
load_dotenv("backend/.env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not configured")


client = Groq(api_key=GROQ_API_KEY)


def generate_report_summary(
    patient: dict,
    laboratory_results: list[dict]
) -> str:

    # Convert laboratory results into readable context
    results_text = "\n".join(
        [
            (
                f"{result['name']}: "
                f"{result['value']} "
                f"{result['unit']} "
                f"(Reference: "
                f"{result['reference_range']})"
            )
            for result in laboratory_results
        ]
    )

    prompt = f"""
You are Mediora AI, a medical-record information assistant.

Your task is to create a SHORT, patient-friendly summary
using ONLY the laboratory information provided below.

STRICT RULES:

1. Use ONLY the information provided in the laboratory results.
2. Do NOT use outside medical knowledge.
3. Do NOT invent medical values.
4. Do NOT change any laboratory value or unit.
5. Do NOT change any reference range.
6. Do NOT diagnose the patient.
7. Do NOT claim that the patient has a disease.
8. Do NOT recommend medicines or treatments.
9. Do NOT create medical facts that are not present.
10. If discussing whether a result is above or below a range,
    compare ONLY with the reference range explicitly provided.
11. Keep the response SHORT and easy for a patient to understand.
12. Mention important results that are above, below, or near
    the boundary of the provided reference range.
13. Do not repeat the complete laboratory report.
14. Do not create headings such as IMAGE TYPE, VISIBLE FINDINGS,
    IMPRESSION, or LIMITATIONS.
15. Return ONLY the concise summary.
16. Clearly state that the summary is based only on the uploaded
    medical record and is not a diagnosis.

Patient Information:
Name: {patient.get("name", "Unknown")}
Age: {patient.get("age", "Not provided")}
Gender: {patient.get("gender", "Not provided")}

Laboratory Results:
{results_text}

Generate a concise patient-friendly summary.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    return response.choices[0].message.content


def generate_image_report_summary(
    patient: dict,
    image_analysis: str
) -> str:

    prompt = f"""
You are Mediora AI, a medical-record information assistant.

Create a SHORT, patient-friendly summary of the
AI-assisted X-ray analysis provided below.

IMPORTANT:

The detailed X-ray analysis has already been generated.
Your job is ONLY to summarize the information.

STRICT RULES:

1. Use ONLY information explicitly contained in the
   X-ray analysis below.
2. Do NOT use outside medical knowledge.
3. Do NOT add new findings.
4. Do NOT invent measurements.
5. Do NOT provide a definitive diagnosis.
6. Do NOT recommend medication or treatment.
7. Do NOT reinterpret the X-ray.
8. Do NOT introduce medical facts that are not present.
9. Do NOT repeat the entire detailed analysis.
10. Keep the summary to approximately 2-4 sentences.
11. Mention the main observed findings and impression.
12. Mention an important limitation if one is explicitly
    present in the source analysis.
13. Do not use headings such as IMAGE TYPE,
    VISIBLE FINDINGS, IMPRESSION, or LIMITATIONS.
14. Do not reproduce the complete source report.
15. Return ONLY the concise summary.
16. State that this is AI-assisted information and
    not a definitive diagnosis.

Patient Information:
Name: {patient.get("name", "Unknown")}
Age: {patient.get("age", "Not provided")}
Gender: {patient.get("gender", "Not provided")}

X-ray Analysis:
{image_analysis}

Generate a concise patient-friendly summary.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    return response.choices[0].message.content