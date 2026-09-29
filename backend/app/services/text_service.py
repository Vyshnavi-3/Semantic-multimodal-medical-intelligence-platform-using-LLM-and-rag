import re


def clean_text(text: str) -> str:
    # Replace multiple spaces with a single space
    text = re.sub(r"[ \t]+", " ", text)

    # Replace multiple blank lines with a single newline
    text = re.sub(r"\n+", "\n", text)

    # Remove spaces at the beginning and end
    text = text.strip()

    return text
def split_text_into_chunks(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> list[str]:
    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - chunk_overlap

    return chunks
def process_document_text(text: str) -> list[str]:
    cleaned_text = clean_text(text)

    chunks = split_text_into_chunks(cleaned_text)

    return chunks