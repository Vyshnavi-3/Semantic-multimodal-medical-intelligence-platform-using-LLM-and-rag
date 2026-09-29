import chromadb
from pathlib import Path


# Get the backend folder
BASE_DIR = Path(__file__).resolve().parents[2]

# Create the ChromaDB folder path
CHROMA_DB_PATH = BASE_DIR / "chroma_db"


# Create a persistent ChromaDB client
client = chromadb.PersistentClient(
    path=str(CHROMA_DB_PATH)
)


# Create or load our medical documents collection
collection = client.get_or_create_collection(
    name="medical_documents"
)


def add_document_chunk(
    chunk_id: str,
    text: str,
    embedding: list[float],
    metadata: dict
):
    collection.add(
        ids=[chunk_id],
        documents=[text],
        embeddings=[embedding],
        metadatas=[metadata]
    )


def search_similar_chunks(
    query_embedding: list[float],
    number_of_results: int = 5,
    patient_id: int | None = None
):
    if patient_id is not None:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=number_of_results,
            where={
                "patient_id": patient_id
            }
        )
    else:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=number_of_results
        )

    return results