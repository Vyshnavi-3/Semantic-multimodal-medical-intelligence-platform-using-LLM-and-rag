import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  ShieldCheck,
  LockKeyhole,
  ScanLine,
  BrainCircuit,
  Database,
  ArrowUpRight,
  FileCheck2,
  AlertTriangle,
  Activity,
  Sparkles,
  Stethoscope,
  ChevronRight,
} from "lucide-react";

export default function UploadDocument() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("");

  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [securityStatus, setSecurityStatus] =
    useState("");

  const [securityMessage, setSecurityMessage] =
    useState("");

  // =====================================================
  // HANDLE FILE
  // =====================================================

  function handleFile(event) {
    const selected =
      event.target.files?.[0];

    if (!selected) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setSecurityStatus("");
    setSecurityMessage("");
    setUploaded(false);

    // Maximum 10 MB
    const maxSize =
      10 * 1024 * 1024;

    if (selected.size > maxSize) {
      setError(
        "File size must be less than 10 MB."
      );

      setFile(null);
      return;
    }

    // Allowed types
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(selected.type)) {
      setError(
        "Only PDF, PNG and JPG files are supported."
      );

      setFile(null);
      return;
    }

    setFile(selected);
  }

  // =====================================================
  // CLEAR FILE
  // =====================================================

  function clearFile() {
    setFile(null);
    setDocumentType("");
    setUploaded(false);
    setError("");
    setSuccessMessage("");
    setSecurityStatus("");
    setSecurityMessage("");
  }

  // =====================================================
  // ANALYZE DOCUMENT
  // =====================================================

  async function analyzeDocument() {
    if (!file) {
      setError(
        "Please select a medical document."
      );
      return;
    }

    if (!documentType) {
      setError(
        "Please select a document type."
      );
      return;
    }

    const savedPatient =
      localStorage.getItem(
        "selectedPatient"
      );

    if (!savedPatient) {
      setError(
        "No patient selected. Please select a patient first."
      );
      return;
    }

    let patient;

    try {
      patient = JSON.parse(savedPatient);
    } catch (error) {
      setError(
        "Invalid patient information. Please select a patient again."
      );
      return;
    }

    if (!patient.id) {
      setError(
        "Patient ID is missing. Please select a patient again."
      );
      return;
    }

    setUploading(true);
    setError("");
    setSuccessMessage("");
    setSecurityStatus("");
    setSecurityMessage("");
    setUploaded(false);

    try {
      const formData =
        new FormData();

      formData.append(
        "patient_id",
        patient.id
      );

      formData.append(
        "document_type",
        documentType
      );

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "http://127.0.0.1:8000/documents/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Document upload failed."
        );
      }

      setSecurityStatus(
        data.security_status || "SAFE"
      );

      setSecurityMessage(
        data.security_message ||
          "Security and antivirus checks passed."
      );

      setUploaded(true);

      setSuccessMessage(
        `Document processed successfully. ${
          data.indexed_chunks || 0
        } text chunks were indexed for AI search.`
      );
    } catch (error) {
      console.error(
        "Document upload error:",
        error
      );

      setError(
        error.message ||
          "Unable to upload document."
      );
    } finally {
      setUploading(false);
    }
  }

  const fileSize =
    file
      ? (file.size / 1024 / 1024).toFixed(2)
      : null;

  return (
    <Layout
      title="Secure document intake"
      subtitle="Add medical records to the patient's clinical intelligence workspace."
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');

        .mediora-upload-page {
          min-height: calc(100vh - 150px);
          background:
            radial-gradient(
              circle at 78% 5%,
              rgba(32,199,181,0.10),
              transparent 27%
            ),
            radial-gradient(
              circle at 8% 92%,
              rgba(155,138,251,0.07),
              transparent 25%
            ),
            #071413;
          border-radius: 28px;
          padding: 30px;
          color: #ecf8f6;
          font-family: "DM Sans", sans-serif;
          position: relative;
          overflow: hidden;
        }

        .mediora-upload-page::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(255,255,255,0.014) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.014) 1px,
              transparent 1px
            );
          background-size: 40px 40px;
        }

        .upload-content-dark {
          position: relative;
          z-index: 2;
        }

        /* ================================================
           HEADER
        ================================================= */

        .upload-heading-dark {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 25px;
          gap: 20px;
        }

        .upload-eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #20c7b5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .upload-heading-dark h1 {
          margin: 0;
          font-family: "Manrope", sans-serif;
          font-size: clamp(29px, 4vw, 43px);
          letter-spacing: -1.8px;
          line-height: 1.05;
        }

        .upload-heading-dark h1 span {
          color: #20c7b5;
        }

        .upload-heading-dark p {
          margin: 10px 0 0;
          color: #718b86;
          font-size: 12px;
          line-height: 1.65;
          max-width: 650px;
        }

        .upload-security-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border-radius: 999px;
          background: rgba(32,199,181,0.055);
          border: 1px solid rgba(32,199,181,0.15);
          color: #8adbd1;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .security-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #20c7b5;
          box-shadow: 0 0 13px rgba(32,199,181,0.9);
        }

        /* ================================================
           MAIN GRID
        ================================================= */

        .upload-command-grid {
          display: grid;
          grid-template-columns: 1.38fr 0.62fr;
          gap: 16px;
          align-items: stretch;
        }

        /* ================================================
           DROP ZONE
        ================================================= */

        .upload-intake-card {
          min-height: 500px;
          border-radius: 25px;
          border: 1px solid rgba(32,199,181,0.14);
          background:
            radial-gradient(
              circle at 52% 38%,
              rgba(32,199,181,0.065),
              transparent 32%
            ),
            linear-gradient(
              145deg,
              #0e2522,
              #0b1b19
            );
          padding: 25px;
          position: relative;
          overflow: hidden;
        }

        .upload-intake-card::before {
          content: "";
          position: absolute;
          width: 310px;
          height: 310px;
          border-radius: 50%;
          border: 1px solid rgba(32,199,181,0.08);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .upload-intake-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .upload-intake-label {
          color: #68827d;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .upload-format-label {
          color: #526c67;
          font-size: 9px;
        }

        .drop-zone-dark {
          min-height: 360px;
          margin-top: 20px;
          border: 1px dashed rgba(32,199,181,0.27);
          border-radius: 21px;
          background:
            radial-gradient(
              circle at center,
              rgba(32,199,181,0.045),
              transparent 55%
            ),
            rgba(4,15,14,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: 0.25s ease;
        }

        .drop-zone-dark:hover {
          border-color: rgba(32,199,181,0.55);
          background:
            radial-gradient(
              circle at center,
              rgba(32,199,181,0.09),
              transparent 55%
            ),
            rgba(4,15,14,0.35);
        }

        .drop-zone-dark input {
          display: none;
        }

        .drop-zone-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 25px;
        }

        .upload-icon-orb {
          width: 78px;
          height: 78px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #20c7b5;
          background:
            linear-gradient(
              145deg,
              rgba(32,199,181,0.15),
              rgba(32,199,181,0.04)
            );
          border: 1px solid rgba(32,199,181,0.18);
          box-shadow:
            0 0 40px rgba(32,199,181,0.07);
          margin-bottom: 22px;
        }

        .drop-zone-inner h2 {
          margin: 0;
          font-family: "Manrope", sans-serif;
          font-size: 22px;
          letter-spacing: -0.8px;
        }

        .drop-zone-inner p {
          color: #6e8883;
          font-size: 11px;
          margin: 8px 0 16px;
        }

        .format-pills {
          display: flex;
          gap: 6px;
        }

        .format-pill {
          padding: 5px 8px;
          border-radius: 6px;
          color: #72908b;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.055);
          font-size: 8px;
          font-weight: 700;
        }

        /* ================================================
           SELECTED FILE
        ================================================= */

        .selected-file-dark {
          min-height: 360px;
          margin-top: 20px;
          border-radius: 21px;
          background:
            linear-gradient(
              145deg,
              rgba(32,199,181,0.08),
              rgba(255,255,255,0.018)
            ),
            rgba(4,15,14,0.4);
          border: 1px solid rgba(32,199,181,0.17);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .selected-file-content {
          width: min(540px, 90%);
        }

        .selected-file-icon {
          width: 65px;
          height: 65px;
          border-radius: 19px;
          background: rgba(32,199,181,0.1);
          border: 1px solid rgba(32,199,181,0.16);
          color: #20c7b5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 19px;
        }

        .selected-file-content h2 {
          margin: 0;
          font-family: "Manrope", sans-serif;
          font-size: 19px;
          overflow-wrap: anywhere;
        }

        .selected-file-content > p {
          color: #637d78;
          font-size: 10px;
          margin: 7px 0 20px;
        }

        .file-detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 13px;
          border-radius: 10px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.045);
          margin-bottom: 7px;
        }

        .file-detail-row span:first-child {
          color: #607974;
          font-size: 9px;
        }

        .file-detail-row span:last-child {
          color: #c1d3cf;
          font-size: 9px;
          font-weight: 700;
        }

        .remove-file-button {
          margin-top: 12px;
          border: 0;
          background: transparent;
          color: #d27676;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          font-size: 9px;
          cursor: pointer;
        }

        /* ================================================
           TYPE SELECTION
        ================================================= */

        .document-type-dark {
          margin-top: 14px;
          padding: 16px;
          border-radius: 16px;
          background: #0d1f1d;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .document-type-dark label {
          display: block;
          color: #7e9893;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-weight: 700;
          margin-bottom: 9px;
        }

        .document-type-dark select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 11px 12px;
          background: #102522;
          color: #d8e8e5;
          font-family: inherit;
          font-size: 11px;
          outline: none;
        }

        .document-type-dark select:focus {
          border-color: rgba(32,199,181,0.4);
        }

        .document-type-dark select option {
          background: #0d1f1d;
          color: #ecf8f6;
        }

        /* ================================================
           RIGHT PANEL
        ================================================= */

        .upload-intelligence-panel {
          display: grid;
          grid-template-rows: 1fr 1fr;
          gap: 16px;
        }

        .intelligence-card {
          border-radius: 23px;
          border: 1px solid rgba(255,255,255,0.065);
          background: #0d1f1d;
          padding: 22px;
          position: relative;
          overflow: hidden;
        }

        .intelligence-card.security-card {
          background:
            radial-gradient(
              circle at 80% 10%,
              rgba(32,199,181,0.1),
              transparent 30%
            ),
            #0d1f1d;
          border-color: rgba(32,199,181,0.12);
        }

        .intelligence-card.pipeline-card {
          background:
            radial-gradient(
              circle at 80% 10%,
              rgba(155,138,251,0.09),
              transparent 30%
            ),
            #0d1f1d;
          border-color: rgba(155,138,251,0.11);
        }

        .intelligence-icon {
          width: 43px;
          height: 43px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #20c7b5;
          background: rgba(32,199,181,0.09);
          margin-bottom: 21px;
        }

        .pipeline-card .intelligence-icon {
          color: #aa9eff;
          background: rgba(155,138,251,0.09);
        }

        .intelligence-card h3 {
          margin: 0;
          font-family: "Manrope", sans-serif;
          font-size: 16px;
          letter-spacing: -0.5px;
        }

        .intelligence-card > p {
          color: #708a85;
          font-size: 10px;
          line-height: 1.7;
          margin: 8px 0 20px;
        }

        .security-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8ca6a1;
          font-size: 9px;
          padding: 9px 0;
          border-top: 1px solid rgba(255,255,255,0.045);
        }

        .security-feature svg {
          color: #20c7b5;
        }

        .pipeline-step {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 10px 0;
        }

        .pipeline-number {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a99eff;
          background: rgba(155,138,251,0.08);
          font-size: 8px;
          font-weight: 800;
        }

        .pipeline-step span {
          color: #78918d;
          font-size: 9px;
        }

        .pipeline-connector {
          width: 1px;
          height: 9px;
          background: rgba(155,138,251,0.14);
          margin-left: 10px;
        }

        /* ================================================
           BUTTONS
        ================================================= */

        .upload-bottom-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 14px;
        }

        .upload-button-dark,
        .clear-button-dark {
          border-radius: 11px;
          padding: 12px 17px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .upload-button-dark {
          border: 0;
          background: #20c7b5;
          color: #061513;
          box-shadow: 0 9px 25px rgba(32,199,181,0.1);
        }

        .upload-button-dark:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 13px 30px rgba(32,199,181,0.2);
        }

        .upload-button-dark:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .clear-button-dark {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          color: #9ab0ac;
        }

        .clear-button-dark:hover:not(:disabled) {
          background: rgba(255,255,255,0.06);
        }

        /* ================================================
           MESSAGES
        ================================================= */

        .upload-message {
          margin-top: 14px;
          border-radius: 15px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 10px;
          line-height: 1.55;
        }

        .upload-error-dark {
          background: rgba(220,70,70,0.07);
          border: 1px solid rgba(220,70,70,0.13);
          color: #dc9696;
        }

        .upload-success-dark {
          background: rgba(32,199,181,0.06);
          border: 1px solid rgba(32,199,181,0.13);
          color: #8bd7ce;
        }

        .security-result-dark {
          margin-top: 14px;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          gap: 11px;
          background: rgba(32,199,181,0.055);
          border: 1px solid rgba(32,199,181,0.13);
        }

        .security-result-dark svg {
          color: #20c7b5;
          flex-shrink: 0;
        }

        .security-result-dark strong {
          display: block;
          color: #d8ebe7;
          font-size: 10px;
        }

        .security-result-dark p {
          color: #77918c;
          font-size: 9px;
          margin: 4px 0 0;
        }

        .security-result-dark span {
          display: block;
          color: #4e6964;
          font-size: 8px;
          margin-top: 6px;
        }

        .documents-link-dark {
          width: 100%;
          margin-top: 9px;
          padding: 11px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          color: #8ca7a2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-family: inherit;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .documents-link-dark:hover {
          background: rgba(255,255,255,0.06);
          color: #c5d7d3;
        }

        /* ================================================
           BOTTOM INFO
        ================================================= */

        .upload-footer-dark {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }

        .footer-info-card {
          border-radius: 15px;
          padding: 14px;
          background: rgba(13,31,29,0.75);
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-info-icon {
          width: 31px;
          height: 31px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #20c7b5;
          background: rgba(32,199,181,0.07);
          flex-shrink: 0;
        }

        .footer-info-card span {
          color: #58716c;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .footer-info-card strong {
          display: block;
          color: #afc4c0;
          font-size: 9px;
          margin-top: 3px;
        }

        @media (max-width: 1000px) {
          .upload-command-grid {
            grid-template-columns: 1fr;
          }

          .upload-intelligence-panel {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
          }
        }

        @media (max-width: 700px) {
          .mediora-upload-page {
            padding: 16px;
            border-radius: 18px;
          }

          .upload-heading-dark {
            display: block;
          }

          .upload-security-chip {
            width: fit-content;
            margin-top: 15px;
          }

          .upload-intake-card {
            padding: 17px;
          }

          .drop-zone-dark,
          .selected-file-dark {
            min-height: 320px;
          }

          .upload-intelligence-panel {
            grid-template-columns: 1fr;
          }

          .upload-footer-dark {
            grid-template-columns: 1fr;
          }

          .upload-bottom-actions {
            justify-content: stretch;
          }

          .upload-button-dark,
          .clear-button-dark {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>

      <div className="mediora-upload-page">

        <div className="upload-content-dark">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="upload-heading-dark">

            <div>

              <div className="upload-eyebrow">
                <Activity size={12} />
                Clinical document intake
              </div>

              <h1>
                Add a medical record
                <span>.</span>
              </h1>

              <p>
                Upload a medical document and let Mediora
                securely process, extract and index the
                information for your clinical workspace.
              </p>

            </div>

            <div className="upload-security-chip">
              <span className="security-pulse"></span>
              Secure processing enabled
            </div>

          </div>

          {/* =================================================
              MAIN
          ================================================= */}

          <div className="upload-command-grid">

            {/* =================================================
                UPLOAD AREA
            ================================================= */}

            <section className="upload-intake-card">

              <div className="upload-intake-top">

                <span className="upload-intake-label">
                  DOCUMENT INTAKE
                </span>

                <span className="upload-format-label">
                  MAX 10 MB
                </span>

              </div>

              {!file ? (

                <label className="drop-zone-dark">

                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFile}
                  />

                  <div className="drop-zone-inner">

                    <div className="upload-icon-orb">
                      <UploadCloud
                        size={35}
                        strokeWidth={1.8}
                      />
                    </div>

                    <h2>
                      Drop your medical document
                    </h2>

                    <p>
                      or select a file from your computer
                    </p>

                    <div className="format-pills">

                      <span className="format-pill">
                        PDF
                      </span>

                      <span className="format-pill">
                        PNG
                      </span>

                      <span className="format-pill">
                        JPG
                      </span>

                      <span className="format-pill">
                        ≤ 10 MB
                      </span>

                    </div>

                  </div>

                </label>

              ) : (

                <div className="selected-file-dark">

                  <div className="selected-file-content">

                    <div className="selected-file-icon">
                      <FileCheck2 size={30} />
                    </div>

                    <h2>
                      {file.name}
                    </h2>

                    <p>
                      Document ready for secure processing
                    </p>

                    <div className="file-detail-row">
                      <span>
                        FILE SIZE
                      </span>

                      <span>
                        {fileSize} MB
                      </span>
                    </div>

                    <div className="file-detail-row">
                      <span>
                        FORMAT
                      </span>

                      <span>
                        {file.type ===
                        "application/pdf"
                          ? "PDF"
                          : file.type
                              .split("/")
                              .pop()
                              .toUpperCase()}
                      </span>
                    </div>

                    <div className="file-detail-row">
                      <span>
                        SECURITY
                      </span>

                      <span>
                        READY FOR SCAN
                      </span>
                    </div>

                    <button
                      type="button"
                      className="remove-file-button"
                      onClick={clearFile}
                      disabled={uploading}
                    >
                      <X size={13} />
                      Remove document
                    </button>

                  </div>

                </div>

              )}

              {/* =================================================
                  DOCUMENT TYPE
              ================================================= */}

              {file && (

                <div className="document-type-dark">

                  <label htmlFor="document-type">
                    Clinical document type
                  </label>

                  <select
                    id="document-type"
                    value={documentType}
                    onChange={(event) =>
                      setDocumentType(
                        event.target.value
                      )
                    }
                    disabled={uploading}
                  >

                    <option value="">
                      Select document type
                    </option>

                    <option value="Laboratory Report">
                      Laboratory Report
                    </option>

                    <option value="X-Ray Image">
                      X-Ray Image
                    </option>

                    <option value="Radiology Report">
                      Radiology Report
                    </option>

                    <option value="Ultrasound">
                      Ultrasound
                    </option>

                    <option value="MRI">
                      MRI
                    </option>

                    <option value="CT Scan">
                      CT Scan
                    </option>

                    <option value="Prescription">
                      Prescription
                    </option>

                    <option value="Other Medical Report">
                      Other Medical Report
                    </option>

                  </select>

                </div>

              )}

            </section>

            {/* =================================================
                INTELLIGENCE PANEL
            ================================================= */}

            <aside className="upload-intelligence-panel">

              {/* SECURITY */}

              <div className="intelligence-card security-card">

                <div className="intelligence-icon">
                  <ShieldCheck size={21} />
                </div>

                <h3>
                  Protected intake
                </h3>

                <p>
                  Your document passes through security
                  and validation checks before entering
                  the medical intelligence pipeline.
                </p>

                <div className="security-feature">
                  <CheckCircle2 size={13} />
                  File validation
                </div>

                <div className="security-feature">
                  <CheckCircle2 size={13} />
                  Antivirus scanning
                </div>

                <div className="security-feature">
                  <CheckCircle2 size={13} />
                  Patient context binding
                </div>

                <div className="security-feature">
                  <LockKeyhole size={13} />
                  Protected processing
                </div>

              </div>

              {/* PIPELINE */}

              <div className="intelligence-card pipeline-card">

                <div className="intelligence-icon">
                  <BrainCircuit size={21} />
                </div>

                <h3>
                  Mediora pipeline
                </h3>

                <p>
                  Once uploaded, the document becomes
                  searchable through the medical AI system.
                </p>

                <div className="pipeline-step">
                  <div className="pipeline-number">
                    01
                  </div>

                  <span>
                    Secure document scan
                  </span>
                </div>

                <div className="pipeline-connector"></div>

                <div className="pipeline-step">
                  <div className="pipeline-number">
                    02
                  </div>

                  <span>
                    Clinical text extraction
                  </span>
                </div>

                <div className="pipeline-connector"></div>

                <div className="pipeline-step">
                  <div className="pipeline-number">
                    03
                  </div>

                  <span>
                    Intelligent indexing
                  </span>
                </div>

                <div className="pipeline-connector"></div>

                <div className="pipeline-step">
                  <div className="pipeline-number">
                    04
                  </div>

                  <span>
                    AI retrieval ready
                  </span>
                </div>

              </div>

            </aside>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="upload-message upload-error-dark">
              <AlertTriangle size={16} />

              <span>
                {error}
              </span>
            </div>

          )}

          {/* =================================================
              SECURITY RESULT
          ================================================= */}

          {securityStatus && (

            <div className="security-result-dark">

              <ShieldCheck size={20} />

              <div>

                <strong>
                  File security check:{" "}
                  {securityStatus.toUpperCase()}
                </strong>

                <p>
                  {securityMessage}
                </p>

                <span>
                  Antivirus and file validation
                  completed successfully.
                </span>

              </div>

            </div>

          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {uploaded && (

            <div className="upload-message upload-success-dark">

              <CheckCircle2 size={17} />

              <div>

                <strong>
                  Document successfully processed
                </strong>

                <div>
                  {successMessage}
                </div>

              </div>

            </div>

          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="upload-bottom-actions">

            <button
              className="clear-button-dark"
              onClick={clearFile}
              disabled={uploading}
            >
              <X size={14} />
              Clear
            </button>

            <button
              className="upload-button-dark"
              disabled={
                !file ||
                !documentType ||
                uploading
              }
              onClick={analyzeDocument}
            >
              {uploading ? (
                <>
                  <Activity size={14} />
                  Processing document...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analyze & secure document
                  <ArrowUpRight size={13} />
                </>
              )}
            </button>

          </div>

          {/* =================================================
              VIEW DOCUMENTS
          ================================================= */}

          {uploaded && (

            <button
              className="documents-link-dark"
              onClick={() =>
                navigate("/documents")
              }
            >
              <FileText size={13} />
              View all medical documents
              <ChevronRight size={13} />
            </button>

          )}

          {/* =================================================
              FOOTER INFORMATION
          ================================================= */}

          <div className="upload-footer-dark">

            <div className="footer-info-card">

              <div className="footer-info-icon">
                <LockKeyhole size={15} />
              </div>

              <div>
                <span>
                  Security
                </span>

                <strong>
                  Antivirus protected
                </strong>
              </div>

            </div>

            <div className="footer-info-card">

              <div className="footer-info-icon">
                <ScanLine size={15} />
              </div>

              <div>
                <span>
                  Extraction
                </span>

                <strong>
                  Clinical data processing
                </strong>
              </div>

            </div>

            <div className="footer-info-card">

              <div className="footer-info-icon">
                <Database size={15} />
              </div>

              <div>
                <span>
                  Intelligence
                </span>

                <strong>
                  RAG search ready
                </strong>
              </div>

            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}