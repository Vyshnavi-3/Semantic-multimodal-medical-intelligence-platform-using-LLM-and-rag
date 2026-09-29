import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import Layout from "../components/Layout";

import {
  FileCheck2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  CalendarDays,
  ScanLine,
  ArrowUpRight,
  Activity,
  ShieldCheck,
  BrainCircuit,
  FileText,
  ExternalLink,
  UserRound,
  Database,
  ChevronRight,
  Stethoscope,
  Clock3,
} from "lucide-react";

export default function Report() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PATIENT
  // =====================================================

  useEffect(() => {
    const savedUser = localStorage.getItem("mediora_user");

    if (!savedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedData = JSON.parse(savedUser);
      const loggedInUser = parsedData?.user;

      if (!loggedInUser) {
        throw new Error("Invalid logged-in user");
      }

      // PATIENT LOGIN
      if (loggedInUser.role === "patient") {
        if (!loggedInUser.patient_id) {
          setError(
            "No patient profile is linked to this account."
          );
          setLoading(false);
          return;
        }

        setPatient({
          id: loggedInUser.patient_id,
          name: loggedInUser.name,
        });

        return;
      }

      // DOCTOR LOGIN
      if (loggedInUser.role === "doctor") {
        const savedPatient =
          localStorage.getItem("selectedPatient");

        if (!savedPatient) {
          navigate("/patients");
          return;
        }

        const parsedPatient = JSON.parse(savedPatient);

        if (!parsedPatient?.id) {
          throw new Error("Invalid selected patient");
        }

        setPatient(parsedPatient);
        return;
      }

      setError("Invalid user role.");
      setLoading(false);
    } catch (error) {
      console.error("Patient loading error:", error);

      setError(
        "Unable to load the patient information."
      );

      setLoading(false);
    }
  }, [navigate]);

  // =====================================================
  // FETCH REPORT
  // =====================================================

  useEffect(() => {
    if (!patient?.id) {
      return;
    }

    async function fetchReport() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/reports/patient/${patient.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to load medical report"
          );
        }

        setPatient(data.patient);
        setDocuments(data.documents || []);
      } catch (error) {
        console.error("Report fetch error:", error);

        setError(
          error.message ||
            "Unable to load medical report."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [patient?.id]);

  // =====================================================
  // AI SUMMARY
  // =====================================================

  useEffect(() => {
    if (!patient?.id) {
      return;
    }

    async function fetchAISummary() {
      try {
        setSummaryLoading(true);
        setSummaryError("");
        setAiSummary("");

        const response = await fetch(
          `http://127.0.0.1:8000/reports/patient/${patient.id}/summary`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to generate AI summary"
          );
        }

        setAiSummary(data.summary || "");
      } catch (error) {
        console.error("AI summary error:", error);

        setSummaryError(
          error.message ||
            "Unable to generate AI summary."
        );
      } finally {
        setSummaryLoading(false);
      }
    }

    fetchAISummary();
  }, [patient?.id]);

  // =====================================================
  // LATEST DOCUMENT
  // =====================================================

  const latestDocument =
    documents.length > 0
      ? documents[0]
      : null;

  const laboratoryResults =
    latestDocument?.laboratory_results || [];

  const imageAnalysis =
    latestDocument?.image_analysis || "";

  const isXRayDocument =
    latestDocument?.document_type
      ?.trim()
      .toLowerCase() === "x-ray image";

  // =====================================================
  // DATE
  // =====================================================

  function formatDate(dateString) {
    if (!dateString) {
      return "Date unavailable";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // =====================================================
  // VIEW
  // =====================================================

  function viewDocument() {
    if (!latestDocument?.document_id) {
      return;
    }

    const url =
      `http://127.0.0.1:8000/documents/` +
      `${latestDocument.document_id}/view`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // =====================================================
  // DOWNLOAD
  // =====================================================

  function downloadDocument() {
    if (!latestDocument?.document_id) {
      return;
    }

    const url =
      `http://127.0.0.1:8000/documents/` +
      `${latestDocument.document_id}/download`;

    window.location.href = url;
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (!patient || loading) {
    return (
      <Layout
        title="Clinical intelligence"
        subtitle="Analyzing your medical record."
      >
        <div className="mediora-report-loading">
          <div className="report-loader-ring">
            <div>
              <BrainCircuit size={24} />
            </div>
          </div>

          <h3>Preparing clinical intelligence</h3>

          <p>
            Mediora is retrieving your latest medical
            information...
          </p>
        </div>
      </Layout>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <Layout
        title="Clinical intelligence"
        subtitle="Medical report workspace."
      >
        <div className="mediora-report-empty">
          <AlertTriangle size={28} />

          <h2>Unable to load report</h2>

          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  // =====================================================
  // NO DOCUMENT
  // =====================================================

  if (!latestDocument) {
    return (
      <Layout
        title="Clinical intelligence"
        subtitle="Your medical report workspace."
      >
        <div className="mediora-report-shell">
          <section className="report-empty-hero">
            <div className="empty-orb">
              <FileText size={30} />
            </div>

            <div>
              <span className="report-eyebrow">
                MEDICAL RECORD
              </span>

              <h1>No report available yet</h1>

              <p>
                Upload a medical document to build your
                clinical intelligence report.
              </p>

              <button
                className="report-primary-button"
                onClick={() => navigate("/upload")}
              >
                Upload medical document
                <ArrowUpRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <Layout
      title="Clinical intelligence"
      subtitle="Structured medical results and AI-assisted interpretation."
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');

        .mediora-report-shell {
          font-family: "DM Sans", sans-serif;
          color: #ecf8f6;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(32,199,181,0.08),
              transparent 27%
            ),
            #071413;
          border-radius: 28px;
          padding: 30px;
          min-height: calc(100vh - 150px);
          position: relative;
          overflow: hidden;
        }

        .mediora-report-shell::before {
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

        .report-content {
          position: relative;
          z-index: 2;
        }

        .report-hero {
          display: grid;
          grid-template-columns: 1.45fr 0.55fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        .report-main-card {
          min-height: 255px;
          border: 1px solid rgba(32,199,181,0.15);
          border-radius: 25px;
          padding: 27px;
          background:
            radial-gradient(
              circle at 82% 18%,
              rgba(32,199,181,0.14),
              transparent 27%
            ),
            linear-gradient(
              145deg,
              #102725,
              #0b1b19
            );
          position: relative;
          overflow: hidden;
        }

        .report-main-card::after {
          content: "";
          position: absolute;
          width: 230px;
          height: 230px;
          right: -95px;
          bottom: -105px;
          border-radius: 50%;
          border: 1px solid rgba(32,199,181,0.12);
          box-shadow:
            0 0 0 35px rgba(32,199,181,0.018),
            0 0 0 70px rgba(32,199,181,0.012);
        }

        .report-eyebrow {
          color: #20c7b5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .report-main-title {
          margin-top: 15px;
          max-width: 720px;
          font-family: "Manrope", sans-serif;
          font-size: clamp(27px, 3vw, 41px);
          line-height: 1.08;
          letter-spacing: -1.8px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .report-main-title span {
          color: #20c7b5;
        }

        .report-document-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 13px;
          color: #718c87;
          font-size: 12px;
        }

        .report-hero-actions {
          position: absolute;
          left: 27px;
          bottom: 27px;
          display: flex;
          gap: 9px;
          z-index: 3;
        }

        .report-primary-button,
        .report-secondary-button {
          border-radius: 11px;
          padding: 11px 15px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .report-primary-button {
          border: 0;
          background: #20c7b5;
          color: #061513;
        }

        .report-primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(32,199,181,0.18);
        }

        .report-secondary-button {
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.035);
          color: #c8d8d5;
        }

        .report-secondary-button:hover {
          background: rgba(255,255,255,0.07);
        }

        .report-status-card {
          border-radius: 25px;
          padding: 23px;
          border: 1px solid rgba(155,138,251,0.16);
          background:
            radial-gradient(
              circle at 70% 15%,
              rgba(155,138,251,0.13),
              transparent 35%
            ),
            #0d1f1d;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .status-icon-large {
          width: 48px;
          height: 48px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b4aaff;
          background: rgba(155,138,251,0.11);
          border: 1px solid rgba(155,138,251,0.13);
        }

        .status-label {
          color: #66817c;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1.3px;
        }

        .status-big {
          margin-top: 6px;
          font-family: "Manrope", sans-serif;
          font-size: 20px;
          font-weight: 800;
        }

        .status-small {
          margin-top: 5px;
          color: #78938f;
          font-size: 10px;
          line-height: 1.5;
        }

        .patient-strip-dark {
          display: grid;
          grid-template-columns: 1.2fr 0.7fr 0.8fr 0.8fr;
          gap: 10px;
          margin-bottom: 18px;
        }

        .patient-info-dark {
          min-height: 74px;
          padding: 13px 15px;
          border-radius: 15px;
          background: #0d1f1d;
          border: 1px solid rgba(255,255,255,0.055);
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .patient-info-icon {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(32,199,181,0.08);
          color: #20c7b5;
          flex-shrink: 0;
        }

        .patient-info-label {
          color: #617b76;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .patient-info-value {
          color: #dceae7;
          font-family: "Manrope", sans-serif;
          font-size: 12px;
          font-weight: 700;
          margin-top: 4px;
        }

        .section-heading-dark {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin: 30px 0 13px;
        }

        .section-heading-dark h2 {
          margin: 4px 0 0;
          font-family: "Manrope", sans-serif;
          font-size: 21px;
          letter-spacing: -0.7px;
        }

        .section-heading-dark p {
          margin: 0;
          color: #627c77;
          font-size: 10px;
        }

        .section-counter {
          color: #20c7b5;
          font-size: 10px;
          font-weight: 700;
          padding: 6px 9px;
          border-radius: 8px;
          background: rgba(32,199,181,0.07);
        }

        .results-grid-dark {
          display: grid;
          grid-template-columns:
            repeat(auto-fit, minmax(210px, 1fr));
          gap: 11px;
        }

        .result-card-dark {
          min-height: 170px;
          padding: 18px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.065);
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.035),
              rgba(255,255,255,0.012)
            ),
            #0d1f1d;
          position: relative;
          overflow: hidden;
          transition: 0.2s ease;
        }

        .result-card-dark:hover {
          transform: translateY(-3px);
          border-color: rgba(32,199,181,0.22);
        }

        .result-card-dark::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 42px;
          height: 3px;
          background: #20c7b5;
          border-radius: 0 0 5px 0;
        }

        .result-number {
          position: absolute;
          right: 15px;
          top: 14px;
          color: #34504b;
          font-family: "Manrope", sans-serif;
          font-size: 10px;
          font-weight: 800;
        }

        .result-name-dark {
          color: #7c9691;
          font-size: 11px;
          font-weight: 600;
          margin-top: 8px;
          max-width: 75%;
        }

        .result-value-dark {
          margin-top: 21px;
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .result-value-dark strong {
          font-family: "Manrope", sans-serif;
          font-size: 30px;
          line-height: 1;
          letter-spacing: -1px;
          color: #effaf8;
        }

        .result-unit-dark {
          color: #20c7b5;
          font-size: 10px;
          font-weight: 700;
        }

        .result-reference-dark {
          margin-top: 17px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.055);
          color: #566f6a;
          font-size: 9px;
        }

        .result-reference-dark span {
          color: #819995;
        }

        .clinical-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 15px;
          margin-top: 18px;
        }

        .clinical-card-dark {
          border-radius: 21px;
          border: 1px solid rgba(255,255,255,0.065);
          background: #0d1f1d;
          padding: 22px;
          overflow: hidden;
        }

        .clinical-card-dark.ai-card {
          background:
            radial-gradient(
              circle at 85% 8%,
              rgba(155,138,251,0.13),
              transparent 28%
            ),
            #0d1f1d;
          border-color: rgba(155,138,251,0.13);
        }

        .clinical-card-dark.xray-card {
          background:
            radial-gradient(
              circle at 85% 8%,
              rgba(92,157,255,0.1),
              transparent 28%
            ),
            #0d1f1d;
        }

        .clinical-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
        }

        .clinical-heading-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(155,138,251,0.1);
          color: #a99cff;
        }

        .xray-card .clinical-heading-icon {
          background: rgba(92,157,255,0.1);
          color: #78b2ff;
        }

        .clinical-heading h2 {
          margin: 0;
          font-family: "Manrope", sans-serif;
          font-size: 15px;
          letter-spacing: -0.3px;
        }

        .clinical-heading span {
          display: block;
          color: #5e7873;
          font-size: 9px;
          margin-top: 3px;
        }

        .ai-summary-content-dark {
          padding-top: 17px;
          color: #a9bfbb;
          font-size: 12px;
          line-height: 1.8;
        }

        .ai-summary-content-dark h3 {
          color: #e8f3f1;
          font-family: "Manrope", sans-serif;
          font-size: 14px;
          margin: 18px 0 7px;
        }

        .ai-summary-content-dark h3:first-child {
          margin-top: 0;
        }

        .ai-summary-content-dark p {
          margin: 7px 0;
        }

        .ai-summary-content-dark ul {
          padding-left: 19px;
          margin: 8px 0;
        }

        .ai-summary-content-dark li {
          margin: 5px 0;
        }

        .ai-summary-content-dark strong {
          color: #dcebe8;
        }

        .ai-table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin-top: 12px;
        }

        .ai-summary-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }

        .ai-summary-table th,
        .ai-summary-table td {
          padding: 9px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .ai-summary-table th {
          color: #20c7b5;
          font-weight: 700;
        }

        .ai-summary-table td {
          color: #9cb5b1;
        }

        .disclaimer-dark {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 19px;
          padding: 11px 12px;
          border-radius: 11px;
          background: rgba(244,166,74,0.055);
          border: 1px solid rgba(244,166,74,0.1);
          color: #9a8972;
          font-size: 9px;
          line-height: 1.55;
        }

        .disclaimer-dark svg {
          color: #f4a64a;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .processing-list {
          margin-top: 17px;
        }

        .processing-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.055);
        }

        .processing-item:last-child {
          border-bottom: 0;
        }

        .processing-item span {
          color: #77918c;
          font-size: 10px;
        }

        .processing-complete {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #20c7b5;
          font-size: 9px;
          font-weight: 700;
        }

        .document-footer-dark {
          margin-top: 18px;
          padding: 19px 21px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.06);
          background: #0d1f1d;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .document-footer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .document-footer-icon {
          width: 39px;
          height: 39px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #20c7b5;
          background: rgba(32,199,181,0.08);
        }

        .document-footer-info strong {
          display: block;
          color: #d8e8e5;
          font-family: "Manrope", sans-serif;
          font-size: 11px;
        }

        .document-footer-info span {
          display: block;
          color: #607a75;
          font-size: 9px;
          margin-top: 3px;
        }

        .document-actions-dark {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mediora-report-loading,
        .mediora-report-empty {
          min-height: 430px;
          border-radius: 25px;
          background: #071413;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #78938f;
          font-family: "DM Sans", sans-serif;
        }

        .mediora-report-loading h3,
        .mediora-report-empty h2 {
          color: #dceae7;
          font-family: "Manrope", sans-serif;
          margin: 18px 0 5px;
        }

        .mediora-report-loading p,
        .mediora-report-empty p {
          max-width: 420px;
          color: #637d78;
          font-size: 11px;
        }

        .mediora-report-empty svg {
          color: #f4a64a;
        }

        .report-loader-ring {
          width: 68px;
          height: 68px;
          border: 2px solid rgba(32,199,181,0.12);
          border-top-color: #20c7b5;
          border-radius: 50%;
          animation: reportSpin 1s linear infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .report-loader-ring > div {
          width: 45px;
          height: 45px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #20c7b5;
          background: #102725;
          animation: reportCounterSpin 1s linear infinite;
        }

        @keyframes reportSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes reportCounterSpin {
          to {
            transform: rotate(-360deg);
          }
        }

        .report-empty-hero {
          min-height: 470px;
          border-radius: 25px;
          background:
            radial-gradient(
              circle at 30% 30%,
              rgba(32,199,181,0.09),
              transparent 35%
            ),
            #0d1f1d;
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          padding: 30px;
        }

        .empty-orb {
          width: 90px;
          height: 90px;
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #20c7b5;
          background: rgba(32,199,181,0.08);
          border: 1px solid rgba(32,199,181,0.15);
        }

        .report-empty-hero h1 {
          margin: 8px 0;
          font-family: "Manrope", sans-serif;
          font-size: 29px;
          letter-spacing: -1px;
        }

        .report-empty-hero p {
          color: #6f8985;
          font-size: 12px;
          margin-bottom: 20px;
        }

        @media (max-width: 1050px) {
          .report-hero {
            grid-template-columns: 1fr;
          }

          .clinical-grid {
            grid-template-columns: 1fr;
          }

          .patient-strip-dark {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .mediora-report-shell {
            padding: 15px;
            border-radius: 18px;
          }

          .patient-strip-dark {
            grid-template-columns: 1fr;
          }

          .report-main-card {
            min-height: 310px;
          }

          .report-hero-actions {
            left: 20px;
            bottom: 20px;
            flex-wrap: wrap;
          }

          .document-footer-dark {
            flex-direction: column;
            align-items: flex-start;
          }

          .report-empty-hero {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>

      <div className="mediora-report-shell">
        <div className="report-content">

          {/* =================================================
              HERO
          ================================================= */}

          <section className="report-hero">

            <div className="report-main-card">

              <span className="report-eyebrow">
                CLINICAL INTELLIGENCE REPORT
              </span>

              <div className="report-main-title">
                {latestDocument.filename}
              </div>

              <div className="report-document-line">
                <FileCheck2 size={14} />
                {latestDocument.document_type ||
                  "Medical Document"}

                <span>•</span>

                <CalendarDays size={13} />

                {formatDate(
                  latestDocument.uploaded_at
                )}
              </div>

              <div className="report-hero-actions">

                <button
                  className="report-primary-button"
                  onClick={viewDocument}
                >
                  <ExternalLink size={14} />
                  Open document
                  <ArrowUpRight size={13} />
                </button>

                <button
                  className="report-secondary-button"
                  onClick={downloadDocument}
                >
                  <Download size={14} />
                  Download
                </button>

              </div>

            </div>

            <div className="report-status-card">

              <div className="status-icon-large">
                <BrainCircuit size={23} />
              </div>

              <div>
                <div className="status-label">
                  AI ANALYSIS
                </div>

                <div className="status-big">
                  {summaryLoading
                    ? "Analyzing"
                    : "Ready"}
                </div>

                <div className="status-small">
                  Medical information has been
                  processed for intelligent retrieval.
                </div>
              </div>

              <div className="status-small">
                <Activity size={12} />
                &nbsp; Patient-context analysis
              </div>

            </div>

          </section>

          {/* =================================================
              PATIENT STRIP
          ================================================= */}

          <section className="patient-strip-dark">

            <div className="patient-info-dark">
              <div className="patient-info-icon">
                <UserRound size={16} />
              </div>

              <div>
                <div className="patient-info-label">
                  Patient
                </div>

                <div className="patient-info-value">
                  {patient.name}
                </div>
              </div>
            </div>

            <div className="patient-info-dark">
              <div className="patient-info-icon">
                <Database size={16} />
              </div>

              <div>
                <div className="patient-info-label">
                  Patient ID
                </div>

                <div className="patient-info-value">
                  #{patient.id}
                </div>
              </div>
            </div>

            <div className="patient-info-dark">
              <div className="patient-info-icon">
                <Clock3 size={16} />
              </div>

              <div>
                <div className="patient-info-label">
                  Report date
                </div>

                <div className="patient-info-value">
                  {formatDate(
                    latestDocument.uploaded_at
                  )}
                </div>
              </div>
            </div>

            <div className="patient-info-dark">
              <div className="patient-info-icon">
                <ShieldCheck size={16} />
              </div>

              <div>
                <div className="patient-info-label">
                  Processing
                </div>

                <div className="patient-info-value">
                  Verified
                </div>
              </div>
            </div>

          </section>

          {/* =================================================
              LAB RESULTS
          ================================================= */}

          <section>

            <div className="section-heading-dark">

              <div>
                <p>STRUCTURED MEDICAL DATA</p>

                <h2>
                  Laboratory results
                </h2>
              </div>

              {laboratoryResults.length > 0 && (
                <div className="section-counter">
                  {laboratoryResults.length} VALUES
                </div>
              )}

            </div>

            {laboratoryResults.length === 0 ? (

              <div className="clinical-card-dark">
                <div className="mediora-report-empty">
                  <FileText size={25} />
                  <p>
                    No structured laboratory results
                    were found in this document.
                  </p>
                </div>
              </div>

            ) : (

              <div className="results-grid-dark">

                {laboratoryResults.map(
                  (result, index) => (

                    <div
                      className="result-card-dark"
                      key={`${result.name}-${index}`}
                    >

                      <div className="result-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="result-name-dark">
                        {result.name}
                      </div>

                      <div className="result-value-dark">
                        <strong>
                          {result.value}
                        </strong>

                        <span className="result-unit-dark">
                          {result.unit || ""}
                        </span>
                      </div>

                      <div className="result-reference-dark">
                        Reference range:&nbsp;

                        <span>
                          {result.reference_range ||
                            "Not provided"}
                        </span>
                      </div>

                    </div>

                  )
                )}

              </div>
            )}

          </section>

          {/* =================================================
              AI + PROCESSING
          ================================================= */}

          <section className="clinical-grid">

            {/* AI SUMMARY */}

            <div className="clinical-card-dark ai-card">

              <div className="clinical-heading">

                <div className="clinical-heading-icon">
                  <Sparkles size={17} />
                </div>

                <div>
                  <h2>
                    AI clinical interpretation
                  </h2>

                  <span>
                    Generated from the uploaded medical record
                  </span>
                </div>

              </div>

              {summaryLoading && (
                <div className="ai-summary-content-dark">
                  <p>
                    Mediora AI is analyzing the
                    available medical information...
                  </p>
                </div>
              )}

              {summaryError && (
                <div className="ai-summary-content-dark">
                  <p>{summaryError}</p>
                </div>
              )}

              {!summaryLoading &&
                !summaryError &&
                aiSummary && (

                  <div className="ai-summary-content-dark">

                    <ReactMarkdown
                      components={{

                        table: ({ children }) => (
                          <div className="ai-table-wrapper">
                            <table className="ai-summary-table">
                              {children}
                            </table>
                          </div>
                        ),

                        h1: ({ children }) => (
                          <h3>{children}</h3>
                        ),

                        h2: ({ children }) => (
                          <h3>{children}</h3>
                        ),

                        h3: ({ children }) => (
                          <h3>{children}</h3>
                        ),

                        p: ({ children }) => (
                          <p>{children}</p>
                        ),

                        ul: ({ children }) => (
                          <ul>{children}</ul>
                        ),

                        li: ({ children }) => (
                          <li>{children}</li>
                        ),

                        strong: ({ children }) => (
                          <strong>{children}</strong>
                        ),

                      }}
                    >
                      {aiSummary.replace(
                        /\\\|/g,
                        "|"
                      )}
                    </ReactMarkdown>

                  </div>
                )}

              {!summaryLoading &&
                !summaryError &&
                !aiSummary && (

                  <div className="ai-summary-content-dark">
                    <p>
                      No AI summary is available
                      for this report.
                    </p>
                  </div>
                )}

              <div className="disclaimer-dark">
                <AlertTriangle size={15} />

                <span>
                  This AI-generated interpretation is
                  intended to help organize and understand
                  medical information. It is not a diagnosis
                  and should not replace professional medical
                  advice.
                </span>
              </div>

            </div>

            {/* PROCESSING */}

            <div className="clinical-card-dark">

              <div className="clinical-heading">

                <div className="clinical-heading-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <h2>
                    Intelligence pipeline
                  </h2>

                  <span>
                    Document processing status
                  </span>
                </div>

              </div>

              <div className="processing-list">

                <div className="processing-item">
                  <span>
                    Document extraction
                  </span>

                  <div className="processing-complete">
                    <CheckCircle2 size={13} />
                    Complete
                  </div>
                </div>

                <div className="processing-item">
                  <span>
                    Clinical text extraction
                  </span>

                  <div className="processing-complete">
                    <CheckCircle2 size={13} />
                    Complete
                  </div>
                </div>

                <div className="processing-item">
                  <span>
                    Structured results
                  </span>

                  <div className="processing-complete">
                    <CheckCircle2 size={13} />
                    Complete
                  </div>
                </div>

                <div className="processing-item">
                  <span>
                    AI analysis
                  </span>

                  <div className="processing-complete">
                    <CheckCircle2 size={13} />
                    {summaryLoading
                      ? "Processing"
                      : "Complete"}
                  </div>
                </div>

                <div className="processing-item">
                  <span>
                    Patient-context retrieval
                  </span>

                  <div className="processing-complete">
                    <CheckCircle2 size={13} />
                    Ready
                  </div>
                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              X-RAY ANALYSIS
          ================================================= */}

          {isXRayDocument && (

            <section className="clinical-card-dark xray-card"
              style={{ marginTop: "18px" }}
            >

              <div className="clinical-heading">

                <div className="clinical-heading-icon">
                  <ScanLine size={17} />
                </div>

                <div>
                  <h2>
                    AI-assisted X-ray analysis
                  </h2>

                  <span>
                    Visual medical document interpretation
                  </span>
                </div>

              </div>

              {imageAnalysis ? (

                <div className="ai-summary-content-dark">

                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h3>{children}</h3>
                      ),

                      h2: ({ children }) => (
                        <h3>{children}</h3>
                      ),

                      h3: ({ children }) => (
                        <h3>{children}</h3>
                      ),

                      p: ({ children }) => (
                        <p>{children}</p>
                      ),

                      ul: ({ children }) => (
                        <ul>{children}</ul>
                      ),

                      li: ({ children }) => (
                        <li>{children}</li>
                      ),
                    }}
                  >
                    {imageAnalysis}
                  </ReactMarkdown>

                </div>

              ) : (

                <div className="ai-summary-content-dark">
                  <p>
                    No AI-assisted image analysis is
                    available for this document.
                  </p>
                </div>

              )}

              <div className="disclaimer-dark">
                <AlertTriangle size={15} />

                <span>
                  AI-assisted image analysis is for
                  informational purposes only and is not
                  a definitive medical diagnosis.
                </span>
              </div>

            </section>

          )}

          {/* =================================================
              DOCUMENT FOOTER
          ================================================= */}

          <section className="document-footer-dark">

            <div className="document-footer-info">

              <div className="document-footer-icon">
                <FileCheck2 size={18} />
              </div>

              <div>
                <strong>
                  Original medical document
                </strong>

                <span>
                  {latestDocument.filename}
                </span>
              </div>

            </div>

            <div className="document-actions-dark">

              <button
                className="report-secondary-button"
                onClick={viewDocument}
              >
                <ExternalLink size={14} />
                View document
              </button>

              <button
                className="report-primary-button"
                onClick={downloadDocument}
              >
                <Download size={14} />
                Download document
              </button>

            </div>

          </section>

          {/* =================================================
              SECURITY FOOTER
          ================================================= */}

          <div
            style={{
              marginTop: "15px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              color: "#4f6964",
              fontSize: "9px",
            }}
          >
            <ShieldCheck size={12} />
            Mediora secure clinical workspace
            <span>•</span>
            AI-assisted information only
          </div>

        </div>
      </div>
    </Layout>
  );
}