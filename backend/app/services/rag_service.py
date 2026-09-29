from backend.app.services.text_service import process_document_text
from backend.app.services.embedding_service import generate_embedding
from backend.app.services.vector_service import (
    add_document_chunk,
    search_similar_chunks,
    collection
)
from backend.app.services.llm_service import generate_medical_answer
from backend.app.database.connection import get_connection


# =========================================================
# INDEX TEXT DOCUMENT
# =========================================================

def index_document(
    patient_id: int,
    document_id: int,
    extracted_text: str
):
    """
    Split extracted medical text into chunks,
    generate embeddings, and store them in ChromaDB.
    """

    chunks = process_document_text(
        extracted_text
    )

    for index, chunk in enumerate(chunks):

        embedding = generate_embedding(
            chunk
        )

        chunk_id = (
            f"patient_{patient_id}"
            f"_document_{document_id}"
            f"_chunk_{index}"
        )

        metadata = {
            "patient_id": patient_id,
            "document_id": document_id,
            "chunk_index": index
        }

        add_document_chunk(
            chunk_id=chunk_id,
            text=chunk,
            embedding=embedding,
            metadata=metadata
        )

    return len(chunks)


# =========================================================
# GET PATIENT INFORMATION
# =========================================================

def get_patient_information(
    patient_id: int
):

    connection = get_connection()

    patient = connection.execute(
        """
        SELECT
            id,
            name,
            age,
            gender
        FROM patients
        WHERE id = ?
        """,
        (patient_id,)
    ).fetchone()

    connection.close()

    if patient is None:
        return None

    return dict(patient)


# =========================================================
# GET PATIENT DOCUMENTS
# =========================================================

def get_patient_documents(
    patient_id: int
):
    """
    Get all medical documents belonging to the
    selected patient.
    """

    connection = get_connection()

    documents = connection.execute(
        """
        SELECT
            id,
            filename,
            document_type,
            uploaded_at,
            image_analysis
        FROM medical_documents
        WHERE patient_id = ?
        ORDER BY uploaded_at DESC
        """,
        (patient_id,)
    ).fetchall()

    connection.close()

    return [
        dict(document)
        for document in documents
    ]


# =========================================================
# GET DOCUMENT INFORMATION
# =========================================================

def get_document_information(
    document_id: int
):

    connection = get_connection()

    document = connection.execute(
        """
        SELECT
            id,
            filename,
            document_type,
            uploaded_at,
            image_analysis
        FROM medical_documents
        WHERE id = ?
        """,
        (document_id,)
    ).fetchone()

    connection.close()

    if document is None:
        return None

    return dict(document)


# =========================================================
# GET PATIENT IMAGE ANALYSES
# =========================================================

def get_patient_image_analyses(
    patient_id: int
):
    """
    Get saved AI-assisted image analyses for the
    selected patient.
    """

    connection = get_connection()

    documents = connection.execute(
        """
        SELECT
            id,
            filename,
            document_type,
            uploaded_at,
            image_analysis
        FROM medical_documents
        WHERE patient_id = ?
          AND image_analysis IS NOT NULL
          AND TRIM(image_analysis) != ''
        ORDER BY uploaded_at DESC
        """,
        (patient_id,)
    ).fetchall()

    connection.close()

    return [
        dict(document)
        for document in documents
    ]


# =========================================================
# CLEAN IMAGE ANALYSIS
# =========================================================

def clean_image_analysis(
    analysis: str
) -> str:
    """
    Remove hidden <think>...</think> sections from
    previously saved AI image analyses.
    """

    if not analysis:
        return ""

    cleaned = analysis.strip()

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

            cleaned = (
                cleaned[:start]
                .strip()
            )

            break

        end += len(
            "</think>"
        )

        cleaned = (
            cleaned[:start]
            + cleaned[end:]
        ).strip()

    return cleaned


# =========================================================
# RETRIEVE TEXT MEDICAL CONTEXT
# =========================================================

def retrieve_medical_context(
    question: str,
    patient_id: int,
    number_of_results: int = 5
):
    """
    Retrieve relevant text chunks belonging only
    to the selected patient.
    """

    query_embedding = generate_embedding(
        question
    )

    results = search_similar_chunks(
        query_embedding=query_embedding,
        number_of_results=number_of_results,
        patient_id=patient_id
    )

    documents = results.get(
        "documents",
        [[]]
    )[0]

    metadatas = results.get(
        "metadatas",
        [[]]
    )[0]

    ids = results.get(
        "ids",
        [[]]
    )[0]

    retrieved_context = []

    for index, document in enumerate(
        documents
    ):

        metadata = (
            metadatas[index]
            if index < len(metadatas)
            else {}
        )

        chunk_id = (
            ids[index]
            if index < len(ids)
            else None
        )

        retrieved_context.append(
            {
                "text": document,
                "metadata": metadata or {},
                "chunk_id": chunk_id
            }
        )

    return retrieved_context


# =========================================================
# DETECT BROAD PATIENT QUESTION
# =========================================================

def is_broad_patient_question(
    question_lower: str
) -> bool:

    broad_phrases = [

        "what information do you have",

        "what information is available",

        "what information is available about this patient",

        "tell me about this patient",

        "information about this patient",

        "summarize the patient",

        "summarize all",

        "what do you know about this patient",

        "give me the patient information",

        "show me patient information"

    ]

    return any(
        phrase in question_lower
        for phrase in broad_phrases
    )


# =========================================================
# DETECT DOCUMENT QUESTION
# =========================================================

def is_document_question(
    question_lower: str
) -> bool:

    document_phrases = [

        "show me the available medical documents",

        "show available medical documents",

        "available medical documents",

        "what medical documents are available",

        "what documents are available",

        "list medical documents",

        "show medical documents",

        "list the medical documents",

        "which medical documents are available",

        "what medical records are available",

        "show me the medical records",

        "list medical records",

        "what records are available"

    ]

    return any(
        phrase in question_lower
        for phrase in document_phrases
    )


# =========================================================
# DETECT IMAGING QUESTION
# =========================================================

def is_imaging_question(
    question_lower: str
) -> bool:

    imaging_keywords = [

        "x-ray",
        "xray",
        "x ray",
        "radiograph",
        "radiology",
        "imaging",
        "image",
        "scan",
        "knee",
        "fracture",
        "dislocation",
        "bone",
        "joint",
        "patella",
        "femur",
        "tibia",
        "fibula",
        "visible findings",
        "impression"

    ]

    return any(
        keyword in question_lower
        for keyword in imaging_keywords
    )


# =========================================================
# BUILD DOCUMENT LIST ANSWER
# =========================================================

def build_document_list_answer(
    patient: dict,
    documents: list
) -> str:
    """
    Create a simple document inventory from the
    application's database.

    This does not use the LLM because the question is
    asking for database metadata rather than medical
    interpretation.
    """

    if not documents:

        return (
            "No medical documents are currently available "
            "for this patient."
        )

    lines = []

    lines.append(
        f"Medical documents available for "
        f"{patient['name']}:"
    )

    lines.append("")

    for index, document in enumerate(
        documents,
        start=1
    ):

        filename = document.get(
            "filename",
            "Unknown file"
        )

        document_type = document.get(
            "document_type",
            "Medical Document"
        )

        uploaded_at = document.get(
            "uploaded_at",
            "Unknown date"
        )

        lines.append(
            f"{index}. {filename}"
        )

        lines.append(
            f"   Type: {document_type}"
        )

        lines.append(
            f"   Uploaded: {uploaded_at}"
        )

        lines.append("")

    lines.append(
        "The documents listed above belong to "
        "the selected patient."
    )

    return "\n".join(
        lines
    )


# =========================================================
# BUILD DOCUMENT SOURCES
# =========================================================

def build_document_sources(
    documents: list
):
    """
    Convert database documents into the same source
    structure expected by the frontend.
    """

    sources = []

    for document in documents:

        sources.append(
            {
                "document_id": document["id"],
                "filename": document["filename"],
                "document_type": document["document_type"],
                "uploaded_at": document["uploaded_at"],
                "chunk_id": None,
                "chunk_index": None
            }
        )

    return sources


# =========================================================
# ANSWER MEDICAL QUESTION
# =========================================================

def answer_medical_question(
    question: str,
    patient_id: int,
    number_of_results: int = 5
):

    # =====================================================
    # GET SELECTED PATIENT
    # =====================================================

    patient = get_patient_information(
        patient_id
    )

    if patient is None:

        return {
            "answer": (
                "I could not find the selected patient "
                "in the medical records."
            ),
            "sources": []
        }


    question_lower = question.lower().strip()


    # =====================================================
    # GET ALL PATIENT DOCUMENTS
    # =====================================================

    patient_documents = get_patient_documents(
        patient_id
    )


    # =====================================================
    # DOCUMENT LIST QUESTION
    # =====================================================

    if is_document_question(
        question_lower
    ):

        answer = build_document_list_answer(
            patient=patient,
            documents=patient_documents
        )

        sources = build_document_sources(
            patient_documents
        )

        return {
            "answer": answer,
            "sources": sources
        }


    # =====================================================
    # BROAD PATIENT QUESTION
    # =====================================================

    broad_question = is_broad_patient_question(
        question_lower
    )


    if broad_question:

        # Get all text chunks belonging to this patient.
        patient_data = collection.get(
            where={
                "patient_id": patient_id
            }
        )

        patient_documents_text = (
            patient_data.get(
                "documents",
                []
            )
        )

        patient_ids = (
            patient_data.get(
                "ids",
                []
            )
        )

        patient_metadatas = (
            patient_data.get(
                "metadatas",
                []
            )
        )

        retrieved_context = []

        for index, document_text in enumerate(
            patient_documents_text[:20]
        ):

            metadata = (
                patient_metadatas[index]
                if index < len(patient_metadatas)
                else {}
            )

            chunk_id = (
                patient_ids[index]
                if index < len(patient_ids)
                else None
            )

            retrieved_context.append(
                {
                    "text": document_text,
                    "metadata": metadata or {},
                    "chunk_id": chunk_id
                }
            )

    else:

        # =================================================
        # NORMAL SEMANTIC SEARCH
        # =================================================

        retrieved_context = retrieve_medical_context(
            question=question,
            patient_id=patient_id,
            number_of_results=number_of_results
        )


    # =====================================================
    # GET IMAGE ANALYSES
    # =====================================================

    image_documents = (
        get_patient_image_analyses(
            patient_id
        )
    )


    # =====================================================
    # SELECT IMAGE ANALYSES
    # =====================================================

    selected_image_documents = []

    imaging_question = is_imaging_question(
        question_lower
    )


    if image_documents:

        if imaging_question or broad_question:

            selected_image_documents = (
                image_documents[:5]
            )


    # =====================================================
    # IF NOTHING WAS FOUND
    # =====================================================

    if (
        not retrieved_context
        and not selected_image_documents
    ):

        return {
            "answer": (
                "I could not find this information in "
                "the provided medical records."
            ),
            "sources": []
        }


    # =====================================================
    # BUILD MEDICAL CONTEXT
    # =====================================================

    medical_context = []


    # =====================================================
    # ADD TEXT CONTEXT
    # =====================================================

    for item in retrieved_context:

        text = item.get(
            "text",
            ""
        )

        if text.strip():

            medical_context.append(
                text
            )


    # =====================================================
    # ADD IMAGE ANALYSIS CONTEXT
    # =====================================================

    for document in selected_image_documents:

        analysis = clean_image_analysis(
            document.get(
                "image_analysis",
                ""
            )
        )

        if not analysis:
            continue


        image_context = (
            "AI-ASSISTED MEDICAL IMAGE ANALYSIS\n"
            f"Document: {document['filename']}\n"
            f"Document Type: {document['document_type']}\n"
            f"Uploaded At: {document['uploaded_at']}\n"
            f"Analysis:\n{analysis}"
        )


        medical_context.append(
            image_context
        )


    # =====================================================
    # SAFETY CHECK
    # =====================================================

    if not medical_context:

        return {
            "answer": (
                "I could not find this information in "
                "the provided medical records."
            ),
            "sources": []
        }


    # =====================================================
    # GENERATE ANSWER
    # =====================================================

    answer = generate_medical_answer(
        question=question,
        medical_context=medical_context,
        patient=patient
    )


    # =====================================================
    # BUILD SOURCES
    # =====================================================

    sources = []

    seen_documents = set()


    # =====================================================
    # TEXT SOURCES
    # =====================================================

    for item in retrieved_context:

        metadata = item.get(
            "metadata",
            {}
        )

        document_id = metadata.get(
            "document_id"
        )

        if document_id is None:
            continue

        if document_id in seen_documents:
            continue

        seen_documents.add(
            document_id
        )


        document = get_document_information(
            document_id
        )

        if document is None:
            continue


        sources.append(
            {
                "document_id": document["id"],
                "filename": document["filename"],
                "document_type": document["document_type"],
                "uploaded_at": document["uploaded_at"],
                "chunk_id": item.get(
                    "chunk_id"
                ),
                "chunk_index": metadata.get(
                    "chunk_index"
                )
            }
        )


    # =====================================================
    # IMAGE SOURCES
    # =====================================================

    for document in selected_image_documents:

        document_id = document["id"]

        if document_id in seen_documents:
            continue

        seen_documents.add(
            document_id
        )


        sources.append(
            {
                "document_id": document["id"],
                "filename": document["filename"],
                "document_type": document["document_type"],
                "uploaded_at": document["uploaded_at"],
                "chunk_id": None,
                "chunk_index": None
            }
        )


    # =====================================================
    # RETURN RESULT
    # =====================================================

    return {
        "answer": answer,
        "sources": sources
    }