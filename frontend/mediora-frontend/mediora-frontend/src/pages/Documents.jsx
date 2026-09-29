import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  ShieldCheck,
  UserRound,
  CalendarDays,
  Database,
  FolderOpen,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Circle,
  Upload,
  X
} from "lucide-react";


/* ========================================================= */
/* MEDIORA THEME                                               */
/* ========================================================= */

const theme = {
  background: "#06110F",
  surface: "#0A1917",
  surface2: "#0D211E",
  surface3: "#102824",

  border: "#183632",
  borderStrong: "#25534B",

  primary: "#20C7B5",
  primaryDark: "#0D8F82",

  blue: "#5C9DFF",
  purple: "#9B8AFB",

  text: "#ECF8F6",
  secondary: "#91AAA6",
  muted: "#607A75",

  success: "#42D6A7",
  danger: "#FF7474"
};


/* ========================================================= */
/* MAIN COMPONENT                                              */
/* ========================================================= */

export default function Documents() {

  const navigate = useNavigate();


  /* ========================================================= */
  /* STATE                                                       */
  /* ========================================================= */

  const [documents, setDocuments] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [patient, setPatient] =
    useState(null);


  /* ========================================================= */
  /* GET SELECTED PATIENT                                        */
  /* ========================================================= */

  useEffect(() => {

    const savedPatient =
      localStorage.getItem(
        "selectedPatient"
      );


    if (!savedPatient) {

      navigate("/patients");

      return;

    }


    try {

      const parsedPatient =
        JSON.parse(
          savedPatient
        );


      if (!parsedPatient?.id) {

        throw new Error(
          "Invalid patient"
        );

      }


      setPatient(
        parsedPatient
      );


    } catch (error) {

      console.error(
        "Invalid patient:",
        error
      );


      localStorage.removeItem(
        "selectedPatient"
      );


      navigate("/patients");

    }

  }, [navigate]);


  /* ========================================================= */
  /* FETCH PATIENT DOCUMENTS                                    */
  /* ========================================================= */

  useEffect(() => {

    if (!patient?.id) {
      return;
    }


    async function fetchDocuments() {

      try {

        setLoading(true);

        setError("");


        const response =
          await fetch(
            `http://127.0.0.1:8000/documents/patient/${patient.id}`
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Failed to load documents"
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


        setError(
          error.message ||
          "Unable to load medical documents."
        );


      } finally {

        setLoading(false);

      }

    }


    fetchDocuments();

  }, [patient]);


  /* ========================================================= */
  /* SEARCH DOCUMENTS                                           */
  /* ========================================================= */

  const filtered =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();


      if (!value) {
        return documents;
      }


      return documents.filter(
        doc =>
          (doc.filename || "")
            .toLowerCase()
            .includes(value) ||

          (doc.document_type || "")
            .toLowerCase()
            .includes(value)
      );

    }, [documents, search]);


  /* ========================================================= */
  /* FORMAT DATE                                                */
  /* ========================================================= */

  function formatDate(
    dateString
  ) {

    if (!dateString) {
      return "Date unavailable";
    }


    const date =
      new Date(
        dateString
      );


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
        month:
          "short",
        day:
          "numeric",
        year:
          "numeric"
      }
    );

  }


  /* ========================================================= */
  /* FORMAT DATE + TIME                                         */
  /* ========================================================= */

  function formatDateTime(
    dateString
  ) {

    if (!dateString) {
      return "Date unavailable";
    }


    const date =
      new Date(
        dateString
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "Date unavailable";

    }


    return date.toLocaleString(
      "en-US",
      {
        month:
          "short",
        day:
          "numeric",
        year:
          "numeric",
        hour:
          "numeric",
        minute:
          "2-digit"
      }
    );

  }


  /* ========================================================= */
  /* VIEW DOCUMENT                                              */
  /* ========================================================= */

  function viewDocument(doc) {

    if (!doc?.id) {

      alert(
        "Document ID is missing."
      );

      return;

    }


    const url =
      `http://127.0.0.1:8000/documents/${doc.id}/view`;


    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  }


  /* ========================================================= */
  /* DOWNLOAD DOCUMENT                                          */
  /* ========================================================= */

  function downloadDocument(doc) {

    if (!doc?.id) {

      alert(
        "Document ID is missing."
      );

      return;

    }


    const url =
      `http://127.0.0.1:8000/documents/${doc.id}/download`;


    window.location.href =
      url;

  }


  /* ========================================================= */
  /* GO TO UPLOAD                                               */
  /* ========================================================= */

  function goToUpload() {

    navigate("/upload");

  }


  /* ========================================================= */
  /* BACK TO PATIENTS                                           */
  /* ========================================================= */

  function backToPatients() {

    navigate("/patients");

  }


  /* ========================================================= */
  /* PATIENT LOADING                                            */
  /* ========================================================= */

  if (!patient) {

    return (

      <Layout
        title="Medical Documents"
        subtitle="Loading patient information."
      >

        <div
          style={{
            minHeight:
              "300px",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            background:
              theme.surface,
            border:
              `1px solid ${theme.border}`,
            borderRadius:
              "18px",
            color:
              theme.secondary,
            fontSize:
              "12px"
          }}
        >

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "9px"
            }}
          >

            <RefreshCw
              size={16}
              style={{
                animation:
                  "spin 1s linear infinite"
              }}
            />

            Loading patient information...

          </div>

        </div>

      </Layout>

    );

  }


  /* ========================================================= */
  /* MAIN UI                                                     */
  /* ========================================================= */

  return (

    <Layout
      title="Medical Documents"
      subtitle="View and manage the patient's uploaded medical records."
    >

      <div
        style={{
          minHeight:
            "100%",
          background:
            theme.background,
          color:
            theme.text,
          fontFamily:
            '"Manrope", "DM Sans", system-ui, sans-serif'
        }}
      >


        {/* =================================================== */}
        {/* PATIENT CONTEXT                                      */}
        {/* =================================================== */}

        <section
          style={{
            position:
              "relative",
            overflow:
              "hidden",
            background:
              "linear-gradient(135deg, #0C211E 0%, #081614 60%, #102925 100%)",
            border:
              `1px solid ${theme.border}`,
            borderRadius:
              "21px",
            padding:
              "23px",
            marginBottom:
              "14px",
            boxShadow:
              "0 16px 50px rgba(0,0,0,0.18)"
          }}
        >

          <div
            style={{
              position:
                "absolute",
              width:
                "230px",
              height:
                "230px",
              borderRadius:
                "50%",
              background:
                "rgba(32,199,181,0.055)",
              right:
                "-90px",
              top:
                "-120px",
              filter:
                "blur(10px)"
            }}
          />


          <div
            style={{
              position:
                "relative",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap:
                "20px",
              flexWrap:
                "wrap"
            }}
          >

            {/* PATIENT */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "13px"
              }}
            >

              <div
                style={{
                  width:
                    "49px",
                  height:
                    "49px",
                  borderRadius:
                    "15px",
                  background:
                    "rgba(32,199,181,0.12)",
                  border:
                    "1px solid rgba(32,199,181,0.16)",
                  color:
                    theme.primary,
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize:
                    "14px",
                  fontWeight:
                    "900"
                }}
              >
                {patient.initials ||
                  getInitials(
                    patient.name
                  )}
              </div>


              <div>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "6px",
                    color:
                      theme.primary,
                    fontSize:
                      "8px",
                    fontWeight:
                      "900",
                    letterSpacing:
                      "1.5px",
                    marginBottom:
                      "5px"
                  }}
                >

                  <Database
                    size={11}
                  />

                  PATIENT MEDICAL RECORD

                </div>


                <h2
                  style={{
                    margin:
                      0,
                    fontSize:
                      "21px",
                    fontWeight:
                      "850",
                    letterSpacing:
                      "-0.5px"
                  }}
                >
                  {patient.name}
                </h2>


                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "7px",
                    flexWrap:
                      "wrap",
                    marginTop:
                      "5px",
                    color:
                      theme.secondary,
                    fontSize:
                      "9px"
                  }}
                >

                  <span>
                    Patient ID · {patient.id}
                  </span>

                  {patient.age !==
                    undefined &&
                    patient.age !==
                    null && (

                    <>
                      <span>•</span>
                      <span>
                        Age {patient.age}
                      </span>
                    </>

                  )}

                  {patient.gender && (

                    <>
                      <span>•</span>
                      <span>
                        {patient.gender}
                      </span>
                    </>

                  )}

                </div>

              </div>

            </div>


            {/* DOCUMENT COUNT */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "10px"
              }}
            >

              <div
                style={{
                  minWidth:
                    "105px",
                  padding:
                    "10px 12px",
                  border:
                    `1px solid ${theme.borderStrong}`,
                  borderRadius:
                    "12px",
                  background:
                    "rgba(32,199,181,0.045)"
                }}
              >

                <div
                  style={{
                    color:
                      theme.primary,
                    fontSize:
                      "8px",
                    fontWeight:
                      "900",
                    letterSpacing:
                      "0.9px"
                  }}
                >
                  DOCUMENTS
                </div>


                <div
                  style={{
                    marginTop:
                      "4px",
                    fontSize:
                      "20px",
                    fontWeight:
                      "850"
                  }}
                >
                  {documents.length}
                </div>

              </div>


              <button
                type="button"
                onClick={
                  backToPatients
                }
                style={{
                  padding:
                    "10px 12px",
                  border:
                    `1px solid ${theme.border}`,
                  borderRadius:
                    "10px",
                  background:
                    "rgba(255,255,255,0.025)",
                  color:
                    theme.secondary,
                  cursor:
                    "pointer",
                  fontSize:
                    "9px",
                  fontWeight:
                    "700"
                }}
              >
                Change Patient
              </button>

            </div>

          </div>

        </section>


        {/* =================================================== */}
        {/* TOOLBAR                                               */}
        {/* =================================================== */}

        <section
          style={{
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap:
              "10px",
            flexWrap:
              "wrap",
            marginBottom:
              "15px"
          }}
        >

          {/* SEARCH */}

          <div
            style={{
              flex:
                "1 1 300px",
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "9px",
              padding:
                "11px 13px",
              background:
                theme.surface,
              border:
                `1px solid ${theme.borderStrong}`,
              borderRadius:
                "11px",
              boxSizing:
                "border-box"
            }}
          >

            <Search
              size={16}
              color={
                theme.muted
              }
            />


            <input
              type="text"
              value={
                search
              }
              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder="Search by document name or type..."
              style={{
                flex:
                  1,
                minWidth:
                  0,
                border:
                  "none",
                outline:
                  "none",
                background:
                  "transparent",
                color:
                  theme.text,
                fontFamily:
                  "inherit",
                fontSize:
                  "11px"
              }}
            />

          </div>


          {/* UPLOAD */}

          <button
            type="button"
            onClick={
              goToUpload
            }
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "7px",
              padding:
                "11px 14px",
              border:
                "none",
              borderRadius:
                "10px",
              background:
                theme.primary,
              color:
                "#061412",
              cursor:
                "pointer",
              fontSize:
                "10px",
              fontWeight:
                "850",
              whiteSpace:
                "nowrap"
            }}
          >

            <Upload
              size={14}
            />

            Upload Document

          </button>

        </section>


        {/* =================================================== */}
        {/* RESULT SUMMARY                                        */}
        {/* =================================================== */}

        {!loading &&
          !error &&
          documents.length > 0 && (

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                marginBottom:
                  "10px",
                gap:
                  "10px"
              }}
            >

              <div>

                <span
                  style={{
                    fontSize:
                      "11px",
                    fontWeight:
                      "800"
                  }}
                >
                  {search
                    ? "Search Results"
                    : "Medical Records"}
                </span>


                <span
                  style={{
                    display:
                      "inline-block",
                    marginLeft:
                      "7px",
                    padding:
                      "3px 7px",
                    borderRadius:
                      "20px",
                    background:
                      theme.surface3,
                    color:
                      theme.primary,
                    fontSize:
                      "8px",
                    fontWeight:
                      "800"
                  }}
                >
                  {filtered.length}
                </span>

              </div>


              {search && (

                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "4px",
                    border:
                      "none",
                    background:
                      "transparent",
                    color:
                      theme.muted,
                    cursor:
                      "pointer",
                    fontSize:
                      "9px"
                  }}
                >

                  <X
                    size={11}
                  />

                  Clear search

                </button>

              )}

            </div>

          )}


        {/* =================================================== */}
        {/* LOADING                                               */}
        {/* =================================================== */}

        {loading && (

          <StatusPanel
            icon={
              RefreshCw
            }
            title="Loading medical records"
            message="Fetching documents for this patient..."
          />

        )}


        {/* =================================================== */}
        {/* ERROR                                                 */}
        {/* =================================================== */}

        {!loading &&
          error && (

            <StatusPanel
              icon={
                AlertCircle
              }
              title="Unable to load documents"
              message={
                error
              }
              danger
            />

          )}


        {/* =================================================== */}
        {/* EMPTY                                                  */}
        {/* =================================================== */}

        {!loading &&
          !error &&
          filtered.length === 0 && (

            <StatusPanel
              icon={
                search
                  ? Search
                  : FolderOpen
              }
              title={
                search
                  ? "No matching documents"
                  : "No medical documents yet"
              }
              message={
                search
                  ? "Try another document name or document type."
                  : "Upload a medical report to begin building this patient's record."
              }
              action={
                !search
                  ? (
                    <button
                      type="button"
                      onClick={
                        goToUpload
                      }
                      style={{
                        marginTop:
                          "13px",
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap:
                          "6px",
                        padding:
                          "9px 12px",
                        border:
                          "none",
                        borderRadius:
                          "9px",
                        background:
                          theme.primary,
                        color:
                          "#061412",
                        cursor:
                          "pointer",
                        fontSize:
                          "9px",
                        fontWeight:
                          "850"
                      }}
                    >

                      <Upload
                        size={13}
                      />

                      Upload First Document

                    </button>
                  )
                  : null
              }
            />

          )}


        {/* =================================================== */}
        {/* DOCUMENT LIST                                          */}
        {/* =================================================== */}

        {!loading &&
          !error &&
          filtered.length > 0 && (

            <section
              style={{
                background:
                  theme.surface,
                border:
                  `1px solid ${theme.border}`,
                borderRadius:
                  "17px",
                overflow:
                  "hidden",
                boxShadow:
                  "0 12px 40px rgba(0,0,0,0.10)"
              }}
            >

              {/* TABLE HEADER */}

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "2.2fr 1.15fr 1.05fr 0.9fr 0.8fr",
                  gap:
                    "10px",
                  padding:
                    "12px 16px",
                  borderBottom:
                    `1px solid ${theme.border}`,
                  color:
                    theme.muted,
                  fontSize:
                    "8px",
                  fontWeight:
                    "900",
                  letterSpacing:
                    "0.9px"
                }}
                className="documents-table-header"
              >

                <span>
                  DOCUMENT
                </span>

                <span>
                  TYPE
                </span>

                <span>
                  DATE
                </span>

                <span>
                  STATUS
                </span>

                <span
                  style={{
                    textAlign:
                      "right"
                  }}
                >
                  ACTIONS
                </span>

              </div>


              {/* ROWS */}

              {filtered.map(
                (doc, index) => (

                  <DocumentRow
                    key={
                      doc.id
                    }
                    doc={
                      doc
                    }
                    index={
                      index
                    }
                    formatDate={
                      formatDate
                    }
                    formatDateTime={
                      formatDateTime
                    }
                    viewDocument={
                      viewDocument
                    }
                    downloadDocument={
                      downloadDocument
                    }
                  />

                )
              )}

            </section>

          )}


        {/* =================================================== */}
        {/* SECURITY NOTICE                                       */}
        {/* =================================================== */}

        <section
          style={{
            display:
              "flex",
            alignItems:
              "flex-start",
            gap:
              "10px",
            marginTop:
              "17px",
            padding:
              "14px 16px",
            border:
              "1px solid rgba(32,199,181,0.13)",
            borderRadius:
              "13px",
            background:
              "rgba(32,199,181,0.035)"
          }}
        >

          <div
            style={{
              width:
                "29px",
              height:
                "29px",
              flexShrink:
                0,
              borderRadius:
                "8px",
              background:
                "rgba(32,199,181,0.08)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center"
            }}
          >

            <ShieldCheck
              size={15}
              color={
                theme.primary
              }
            />

          </div>


          <div>

            <div
              style={{
                fontSize:
                  "10px",
                fontWeight:
                  "800"
              }}
            >
              Protected medical records
            </div>


            <p
              style={{
                margin:
                  "4px 0 0",
                color:
                  theme.muted,
                fontSize:
                  "9px",
                lineHeight:
                  1.6
              }}
            >
              Medical documents are displayed for
              the currently selected patient.
              Access patient information only for
              authorized clinical purposes.
            </p>

          </div>

        </section>

      </div>


      {/* ===================================================== */}
      {/* RESPONSIVE                                             */}
      {/* ===================================================== */}

      <style>
        {`

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }


          @media (max-width: 900px) {

            .documents-table-header {
              display: none !important;
            }

            .documents-table-row {
              display: flex !important;
              flex-direction: column !important;
              gap: 11px !important;
            }

            .document-row-cell {
              width: 100% !important;
            }

            .document-actions-mobile {
              justify-content: flex-start !important;
            }

          }

        `}
      </style>

    </Layout>

  );

}


/* ========================================================= */
/* DOCUMENT ROW                                                */
/* ========================================================= */

function DocumentRow({
  doc,
  index,
  formatDate,
  formatDateTime,
  viewDocument,
  downloadDocument
}) {

  return (

    <div
      className="documents-table-row document-table-row"
      style={{
        display:
          "grid",
        gridTemplateColumns:
          "2.2fr 1.15fr 1.05fr 0.9fr 0.8fr",
        gap:
          "10px",
        alignItems:
          "center",
        padding:
          "13px 16px",
        borderBottom:
          index === 0
            ? "none"
            : `1px solid ${theme.border}`,
        background:
          index % 2 === 0
            ? "rgba(255,255,255,0.008)"
            : "transparent"
      }}
    >

      {/* DOCUMENT */}

      <div
        className="document-row-cell"
        style={{
          minWidth:
            0,
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "10px"
        }}
      >

        <div
          style={{
            width:
              "37px",
            height:
              "37px",
            flexShrink:
              0,
            borderRadius:
              "10px",
            background:
              "rgba(92,157,255,0.08)",
            border:
              "1px solid rgba(92,157,255,0.13)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center"
          }}
        >

          <FileText
            size={17}
            color={
              theme.blue
            }
          />

        </div>


        <div
          style={{
            minWidth:
              0
          }}
        >

          <div
            style={{
              fontSize:
                "11px",
              fontWeight:
                "800",
              whiteSpace:
                "nowrap",
              overflow:
                "hidden",
              textOverflow:
                "ellipsis"
            }}
            title={
              doc.filename
            }
          >
            {doc.filename}
          </div>


          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "4px",
              marginTop:
                "4px",
              color:
                theme.muted,
              fontSize:
                "8px"
            }}
          >

            <CalendarDays
              size={10}
            />

            Uploaded{" "}

            {formatDateTime(
              doc.uploaded_at
            )}

          </div>

        </div>

      </div>


      {/* TYPE */}

      <div
        className="document-row-cell"
        style={{
          color:
            theme.secondary,
          fontSize:
            "9px"
        }}
      >

        <span
          style={{
            display:
              "inline-block",
            padding:
              "5px 7px",
            borderRadius:
              "6px",
            background:
              "rgba(155,138,251,0.07)",
            color:
              "#B3A8FF",
            fontSize:
              "8px",
            fontWeight:
              "700"
          }}
        >
          {doc.document_type ||
            "Medical Document"}
        </span>

      </div>


      {/* DATE */}

      <div
        className="document-row-cell"
        style={{
          color:
            theme.secondary,
          fontSize:
            "9px"
        }}
      >

        {formatDate(
          doc.uploaded_at
        )}

      </div>


      {/* STATUS */}

      <div
        className="document-row-cell"
      >

        <span
          style={{
            display:
              "inline-flex",
            alignItems:
              "center",
            gap:
              "5px",
            padding:
              "5px 7px",
            borderRadius:
              "20px",
            background:
              "rgba(66,214,167,0.07)",
            border:
              "1px solid rgba(66,214,167,0.12)",
            color:
              theme.success,
            fontSize:
              "8px",
            fontWeight:
              "800"
          }}
        >

          <CheckCircle2
            size={11}
          />

          Processed

        </span>

      </div>


      {/* ACTIONS */}

      <div
        className="document-row-cell document-actions-mobile"
        style={{
          display:
            "flex",
          justifyContent:
            "flex-end",
          gap:
            "5px"
        }}
      >

        <ActionButton
          icon={
            Eye
          }
          label="View"
          onClick={() =>
            viewDocument(
              doc
            )
          }
        />


        <ActionButton
          icon={
            Download
          }
          label="Download"
          onClick={() =>
            downloadDocument(
              doc
            )
          }
        />

      </div>

    </div>

  );

}


/* ========================================================= */
/* ACTION BUTTON                                               */
/* ========================================================= */

function ActionButton({
  icon: Icon,
  label,
  onClick
}) {

  return (

    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      style={{
        width:
          "30px",
        height:
          "30px",
        border:
          `1px solid ${theme.border}`,
        borderRadius:
          "8px",
        background:
          "rgba(255,255,255,0.025)",
        color:
          theme.secondary,
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        cursor:
          "pointer"
      }}
    >

      <Icon
        size={14}
      />

    </button>

  );

}


/* ========================================================= */
/* STATUS PANEL                                                */
/* ========================================================= */

function StatusPanel({
  icon: Icon,
  title,
  message,
  danger = false,
  action = null
}) {

  return (

    <div
      style={{
        minHeight:
          "240px",
        display:
          "flex",
        flexDirection:
          "column",
        alignItems:
          "center",
        justifyContent:
          "center",
        textAlign:
          "center",
        padding:
          "25px",
        background:
          danger
            ? "rgba(255,116,116,0.035)"
            : theme.surface,
        border:
          `1px solid ${
            danger
              ? "rgba(255,116,116,0.18)"
              : theme.border
          }`,
        borderRadius:
          "17px"
      }}
    >

      <div
        style={{
          width:
            "46px",
          height:
            "46px",
          borderRadius:
            "13px",
          background:
            danger
              ? "rgba(255,116,116,0.08)"
              : "rgba(32,199,181,0.07)",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          marginBottom:
            "12px"
        }}
      >

        <Icon
          size={20}
          color={
            danger
              ? theme.danger
              : theme.primary
          }
        />

      </div>


      <h3
        style={{
          margin:
            "0 0 6px",
          fontSize:
            "14px",
          fontWeight:
            "800"
        }}
      >
        {title}
      </h3>


      <p
        style={{
          maxWidth:
            "450px",
          margin:
            0,
          color:
            theme.muted,
          fontSize:
            "10px",
          lineHeight:
            1.6
        }}
      >
        {message}
      </p>


      {action}

    </div>

  );

}


/* ========================================================= */
/* INITIALS                                                    */
/* ========================================================= */

function getInitials(
  name
) {

  if (!name) {
    return "P";
  }


  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(
      word =>
        word[0]
    )
    .join("")
    .substring(
      0,
      2
    )
    .toUpperCase();

}