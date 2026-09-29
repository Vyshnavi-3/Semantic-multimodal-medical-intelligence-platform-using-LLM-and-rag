import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
  FileText,
  UploadCloud,
  MessageSquare,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from "lucide-react";


export default function Dashboard() {

  const navigate = useNavigate();


  // --------------------------------------------------
  // Patient state
  // --------------------------------------------------

  const [patient, setPatient] = useState(null);


  // --------------------------------------------------
  // Document state
  // --------------------------------------------------

  const [documents, setDocuments] = useState([]);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [documentError, setDocumentError] =
    useState("");


  // --------------------------------------------------
  // Load selected patient
  // --------------------------------------------------

  useEffect(() => {

    const savedPatient =
      localStorage.getItem("selectedPatient");


    if (!savedPatient) {

      navigate("/patients");

      return;
    }


    try {

      const parsedPatient =
        JSON.parse(savedPatient);


      if (!parsedPatient?.id) {

        throw new Error(
          "Invalid patient information"
        );
      }


      setPatient(parsedPatient);

    } catch (error) {

      console.error(
        "Invalid selected patient:",
        error
      );


      localStorage.removeItem(
        "selectedPatient"
      );


      navigate("/patients");
    }

  }, [navigate]);


  // --------------------------------------------------
  // Fetch patient's medical documents
  // --------------------------------------------------

  useEffect(() => {

    if (!patient?.id) {
      return;
    }


    async function fetchDocuments() {

      try {

        setLoadingDocuments(true);

        setDocumentError("");


        const response = await fetch(
          `http://127.0.0.1:8000/documents/patient/${patient.id}`
        );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Failed to load medical documents"
          );
        }


        setDocuments(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Document fetch error:",
          error
        );


        setDocumentError(
          "Unable to load medical documents."
        );

      } finally {

        setLoadingDocuments(false);
      }
    }


    fetchDocuments();

  }, [patient]);


  // --------------------------------------------------
  // Loading patient
  // --------------------------------------------------

  if (!patient) {

    return (

      <Layout
        title="Loading..."
        subtitle="Loading patient information."
      >

        <div className="patient-status">
          Loading patient information...
        </div>

      </Layout>
    );
  }


  // --------------------------------------------------
  // Patient initials
  // --------------------------------------------------

  const initials =
    patient.name
      ? patient.name
          .split(" ")
          .map((name) => name[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "P";


  // --------------------------------------------------
  // Format document date
  // --------------------------------------------------

  function formatDate(dateString) {

    if (!dateString) {
      return "Date unavailable";
    }


    const date =
      new Date(dateString);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "Date unavailable";
    }


    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );
  }


  // --------------------------------------------------
  // Document type label
  // --------------------------------------------------

  function getDocumentType(document) {

    return (
      document.document_type ||
      "Medical Document"
    );
  }


  // --------------------------------------------------
  // Recent documents
  // --------------------------------------------------

  const recentDocuments =
    documents.slice(0, 3);


  return (

    <Layout
      title={`Good evening, ${
        patient.name?.split(" ")[0] || "Patient"
      }`}
      subtitle="Here's your medical intelligence overview."
    >


      {/* ==================================================
          ACTIVE PATIENT
      ================================================== */}

      <section className="active-patient">

        <div className="active-patient-left">

          <div className="patient-avatar large">
            {initials}
          </div>


          <div>

            <p className="mini-label">
              ACTIVE PATIENT
            </p>


            <h2>
              {patient.name}
            </h2>


            <span>

              {
                patient.age !== null &&
                patient.age !== undefined
                  ? `${patient.age} years`
                  : "Age not provided"
              }

              {" · "}

              {
                patient.gender ||
                "Gender not provided"
              }

              {" · Patient ID "}

              {patient.id}

            </span>

          </div>

        </div>


        <button
          onClick={() =>
            navigate("/patients")
          }
          className="change-patient"
        >
          Change patient
        </button>

      </section>


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <section className="stats">


        {/* Medical documents */}

        <div className="stat">

          <div className="stat-icon">
            <FileText />
          </div>


          <div>

            <span>
              Medical documents
            </span>


            <strong>
              {documents.length}
            </strong>


            <small>
              Uploaded for this patient
            </small>

          </div>

        </div>


        {/* Reports analyzed */}

        <div className="stat">

          <div className="stat-icon">
            <Activity />
          </div>


          <div>

            <span>
              Reports analyzed
            </span>


            <strong>
              {documents.length}
            </strong>


            <small>
              Available in medical records
            </small>

          </div>

        </div>


        {/* AI conversations */}

        <div className="stat">

          <div className="stat-icon">
            <MessageSquare />
          </div>


          <div>

            <span>
              AI conversations
            </span>


            <strong>
              —
            </strong>


            <small>
              Conversation history coming soon
            </small>

          </div>

        </div>

      </section>


      {/* ==================================================
          ACTION CARDS
      ================================================== */}

      <section className="dashboard-grid">


        {/* Upload */}

        <div
          className="action-card"
          onClick={() =>
            navigate("/upload")
          }
        >

          <div className="action-icon">
            <UploadCloud />
          </div>


          <h3>
            Upload medical document
          </h3>


          <p>
            Add lab reports, prescriptions,
            scans and clinical documents.
          </p>


          <span className="action-link">

            Upload document

            <ArrowUpRight size={17} />

          </span>

        </div>


        {/* AI Chat */}

        <div
          className="action-card"
          onClick={() =>
            navigate("/chat")
          }
        >

          <div className="action-icon">
            <MessageSquare />
          </div>


          <h3>
            Ask Mediora AI
          </h3>


          <p>
            Ask questions about medical records
            using contextual AI assistance.
          </p>


          <span className="action-link">

            Start conversation

            <ArrowUpRight size={17} />

          </span>

        </div>


        {/* Reports */}

        <div
          className="action-card"
          onClick={() =>
            navigate("/report")
          }
        >

          <div className="action-icon">
            <Activity />
          </div>


          <h3>
            View results
          </h3>


          <p>
            Review extracted medical values,
            findings and report summaries.
          </p>


          <span className="action-link">

            View results

            <ArrowUpRight size={17} />

          </span>

        </div>


      </section>


      {/* ==================================================
          RECENT MEDICAL DOCUMENTS
      ================================================== */}

      <section className="recent">


        <div className="section-title">

          <div>

            <p className="mini-label">
              RECENT ACTIVITY
            </p>


            <h2>
              Medical documents
            </h2>

          </div>


          <button
            onClick={() =>
              navigate("/documents")
            }
          >

            View all

            <ArrowUpRight size={16} />

          </button>

        </div>


        {/* Loading */}

        {loadingDocuments && (

          <div className="patient-status">
            Loading medical documents...
          </div>

        )}


        {/* Error */}

        {!loadingDocuments &&
          documentError && (

            <div className="patient-status">
              {documentError}
            </div>

        )}


        {/* No documents */}

        {!loadingDocuments &&
          !documentError &&
          recentDocuments.length === 0 && (

            <div className="patient-status">
              No medical documents uploaded yet.
            </div>

        )}


        {/* Documents */}

        {!loadingDocuments &&
          !documentError &&
          recentDocuments.length > 0 && (

            <div className="document-list">

              {recentDocuments.map(
                (document) => (

                  <div
                    className="document-item"
                    key={document.id}
                  >


                    <div className="document-icon">
                      <FileText />
                    </div>


                    <div className="document-details">

                      <strong>
                        {
                          document.filename ||
                          "Medical Document"
                        }
                      </strong>


                      <span>

                        {
                          getDocumentType(
                            document
                          )
                        }

                        {" · "}

                        {
                          formatDate(
                            document.uploaded_at
                          )
                        }

                      </span>

                    </div>


                    <div className="processed">

                      <CheckCircle2
                        size={15}
                      />

                      Processed

                    </div>


                    <Clock size={17} />

                  </div>

                )
              )}

            </div>

        )}

      </section>

    </Layout>
  );
}