import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  Bot,
  UserRound,
  Send,
  Sparkles,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Database,
  BrainCircuit,
  ChevronRight,
  Activity,
  AlertCircle,
  MessageSquareText,
  BookOpen,
  Search,
  Circle
} from "lucide-react";


/* ========================================================= */
/* THEME                                                       */
/* ========================================================= */

const COLORS = {
  bg: "#06110F",
  panel: "#0A1917",
  panel2: "#0D211E",
  panel3: "#102824",
  border: "#183632",
  borderStrong: "#25534B",

  primary: "#20C7B5",
  primaryDark: "#0D8F82",
  primarySoft: "rgba(32, 199, 181, 0.09)",
  primaryGlow: "rgba(32, 199, 181, 0.18)",

  purple: "#9B8AFB",
  purpleSoft: "rgba(155, 138, 251, 0.10)",

  text: "#ECF8F6",
  muted: "#91AAA6",
  mutedDark: "#607A75",

  userBubble: "#153832",

  success: "#42D6A7",
  successSoft: "rgba(66, 214, 167, 0.10)",

  danger: "#FF7474",
  dangerSoft: "rgba(255, 116, 116, 0.10)"
};


/* ========================================================= */
/* MAIN COMPONENT                                              */
/* ========================================================= */

export default function Chat() {

  const [patient, setPatient] =
    useState(null);

  const [documentCount, setDocumentCount] =
    useState(0);

  const [messages, setMessages] =
    useState([
      {
        id: 1,
        role: "ai",
        text:
          "Hello! I'm Mediora AI. I can help you understand the medical documents and information available in this patient's workspace.",
        sources: []
      }
    ]);

  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef(null);


  /* ========================================================= */
  /* SUGGESTED QUESTIONS                                        */
  /* ========================================================= */

  const suggestedQuestions = [
    {
      icon: Activity,
      title: "Latest results",
      question:
        "What are the latest blood test results?"
    },
    {
      icon: Search,
      title: "HbA1c",
      question:
        "What is the patient's HbA1c?"
    },
    {
      icon: BookOpen,
      title: "Patient overview",
      question:
        "What information is available about this patient?"
    },
    {
      icon: FileText,
      title: "Medical documents",
      question:
        "Show me the available medical documents."
    }
  ];


  /* ========================================================= */
  /* LOAD SELECTED PATIENT                                      */
  /* ========================================================= */

  useEffect(() => {

    const storedPatient =
      localStorage.getItem(
        "selectedPatient"
      );

    if (!storedPatient) {

      setError(
        "No patient is selected. Please select a patient first."
      );

      return;
    }

    try {

      const parsedPatient =
        JSON.parse(storedPatient);

      if (!parsedPatient?.id) {

        setError(
          "The selected patient is invalid."
        );

        return;
      }

      setPatient(parsedPatient);

    } catch (err) {

      console.error(
        "Failed to read selected patient:",
        err
      );

      setError(
        "Unable to load the selected patient."
      );

    }

  }, []);


  /* ========================================================= */
  /* LOAD PATIENT DOCUMENTS                                    */
  /* ========================================================= */

  useEffect(() => {

    if (!patient?.id) {
      return;
    }

    const loadDocuments =
      async () => {

        try {

          const response =
            await fetch(
              `http://127.0.0.1:8000/documents/patient/${patient.id}`
            );

          if (!response.ok) {

            throw new Error(
              "Failed to load documents"
            );

          }

          const data =
            await response.json();

          if (Array.isArray(data)) {

            setDocumentCount(
              data.length
            );

          }

        } catch (err) {

          console.error(
            "Document loading error:",
            err
          );

          setDocumentCount(0);

        }

      };

    loadDocuments();

  }, [patient]);


  /* ========================================================= */
  /* AUTO SCROLL                                                */
  /* ========================================================= */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages, loading]);


  /* ========================================================= */
  /* SEND MESSAGE                                               */
  /* ========================================================= */

  const sendMessage =
    async (questionText) => {

      if (loading) {
        return;
      }

      const text =
        (
          questionText !== undefined
            ? questionText
            : question
        ).trim();

      if (!text) {
        return;
      }

      if (!patient?.id) {

        setError(
          "Please select a patient before using the AI Assistant."
        );

        return;
      }

      setError("");

      const userMessage = {
        id:
          `user-${Date.now()}-${Math.random()}`,
        role: "user",
        text,
        sources: []
      };

      setMessages(
        previous => [
          ...previous,
          userMessage
        ]
      );

      setQuestion("");

      setLoading(true);

      try {

        /* ===================================================== */
        /* BACKEND REQUEST                                       */
        /* ===================================================== */

        const response =
          await fetch(
            "http://127.0.0.1:8000/chat/",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                patient_id:
                  patient.id,

                question:
                  text
              })
            }
          );


        const data =
          await response.json();


        console.log(
          "Mediora Chat Response:",
          data
        );


        /* ===================================================== */
        /* BACKEND ERROR                                         */
        /* ===================================================== */

        if (!response.ok) {

          throw new Error(
            data?.detail ||
            "Unable to get a response from Mediora AI."
          );

        }


        /* ===================================================== */
        /* AI RESPONSE                                           */
        /* ===================================================== */

        const answer =
          typeof data?.answer === "string"
            ? data.answer.trim()
            : "";


        const sources =
          Array.isArray(data?.sources)
            ? data.sources
            : [];


        const aiMessage = {

          id:
            `ai-${Date.now()}-${Math.random()}`,

          role:
            "ai",

          text:
            answer ||
            "I could not find this information in the provided medical records.",

          sources

        };


        setMessages(
          previous => [
            ...previous,
            aiMessage
          ]
        );


      } catch (err) {

        console.error(
          "Chat error:",
          err
        );


        setMessages(
          previous => [
            ...previous,
            {
              id:
                `error-${Date.now()}-${Math.random()}`,

              role:
                "ai",

              text:
                "Sorry, I was unable to process your request. Please make sure the backend server is running.",

              sources: []
            }
          ]
        );

      } finally {

        setLoading(false);

      }

    };


  /* ========================================================= */
  /* ENTER KEY                                                 */
  /* ========================================================= */

  const handleKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        if (!loading) {
          sendMessage();
        }

      }

    };


  /* ========================================================= */
  /* SUGGESTED QUESTION                                        */
  /* ========================================================= */

  const handleSuggestedQuestion =
    (suggestedQuestion) => {

      if (loading) {
        return;
      }

      sendMessage(
        suggestedQuestion
      );

    };


  /* ========================================================= */
  /* CLEAR CHAT                                                */
  /* ========================================================= */

  const clearChat =
    () => {

      if (loading) {
        return;
      }

      setMessages([
        {
          id: 1,
          role: "ai",
          text:
            "Hello! I'm Mediora AI. I can help you understand the medical documents and information available in this patient's workspace.",
          sources: []
        }
      ]);

      setError("");

    };


  /* ========================================================= */
  /* VIEW SOURCE                                               */
  /* ========================================================= */

  const viewSource =
    (source) => {

      if (!source?.document_id) {
        return;
      }

      const url =
        `http://127.0.0.1:8000/documents/${source.document_id}/view`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

    };


  /* ========================================================= */
  /* FORMAT SOURCE DATE                                        */
  /* ========================================================= */

  const formatSourceDate =
    (dateValue) => {

      if (!dateValue) {
        return "";
      }

      const date =
        new Date(dateValue);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return dateValue;

      }

      return date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      );

    };


  /* ========================================================= */
  /* UNIQUE SOURCES                                            */
  /* ========================================================= */

  const getUniqueSources =
    (sources) => {

      if (!Array.isArray(sources)) {
        return [];
      }

      const seen =
        new Set();

      return sources.filter(
        source => {

          const key =
            source?.document_id;

          if (!key) {
            return false;
          }

          if (seen.has(key)) {
            return false;
          }

          seen.add(key);

          return true;

        }
      );

    };


  /* ========================================================= */
  /* MESSAGE COUNT                                             */
  /* ========================================================= */

  const userMessageCount =
    useMemo(
      () =>
        messages.filter(
          message =>
            message.role === "user"
        ).length,
      [messages]
    );


  /* ========================================================= */
  /* RENDER                                                     */
  /* ========================================================= */

  return (

    <div
      style={{
        minHeight: "100%",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily:
          '"Manrope", "DM Sans", system-ui, sans-serif',
        paddingBottom: "35px"
      }}
    >

      {/* ===================================================== */}
      {/* HERO                                                    */}
      {/* ===================================================== */}

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0C211E 0%, #081715 58%, #102925 100%)",
          border:
            `1px solid ${COLORS.border}`,
          borderRadius: "24px",
          padding: "28px",
          marginBottom: "18px",
          boxShadow:
            "0 20px 65px rgba(0,0,0,0.22)"
        }}
      >

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background:
              "rgba(32,199,181,0.07)",
            right: "-90px",
            top: "-140px",
            filter: "blur(8px)"
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "25px",
            flexWrap: "wrap"
          }}
        >

          {/* Left */}
          <div
            style={{
              display: "flex",
              gap: "17px",
              alignItems: "flex-start"
            }}
          >

            <div
              style={{
                width: "57px",
                height: "57px",
                flexShrink: 0,
                borderRadius: "17px",
                background:
                  "linear-gradient(145deg, #20C7B5, #0D8F82)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 12px 32px rgba(32,199,181,0.22)"
              }}
            >
              <BrainCircuit
                size={28}
                color="#061412"
              />
            </div>


            <div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "7px"
                }}
              >

                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    letterSpacing:
                      "2px",
                    color:
                      COLORS.primary
                  }}
                >
                  MEDIORA INTELLIGENCE
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    color:
                      COLORS.success,
                    fontSize: "9px",
                    fontWeight: "800"
                  }}
                >
                  <Circle
                    size={6}
                    fill="currentColor"
                  />
                  ONLINE
                </span>

              </div>


              <h1
                style={{
                  margin: 0,
                  fontSize:
                    "clamp(25px, 4vw, 34px)",
                  lineHeight: 1.1,
                  fontWeight: "800",
                  letterSpacing:
                    "-1px"
                }}
              >
                Medical AI Assistant
              </h1>


              <p
                style={{
                  margin:
                    "9px 0 0",
                  color:
                    COLORS.muted,
                  fontSize: "13px",
                  lineHeight: 1.65,
                  maxWidth: "650px"
                }}
              >
                Ask questions about the patient's
                uploaded medical records and let
                Mediora retrieve relevant information
                for you.
              </p>

            </div>

          </div>


          {/* Right stats */}
          <div
            style={{
              display: "flex",
              gap: "9px"
            }}
          >

            <StatBox
              icon={FileText}
              value={documentCount}
              label="Documents"
            />

            <StatBox
              icon={MessageSquareText}
              value={userMessageCount}
              label="Questions"
            />

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* PATIENT CONTEXT                                        */}
      {/* ===================================================== */}

      {patient && (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1.4fr 1fr 1fr",
            gap: "9px",
            marginBottom: "18px"
          }}
          className="ai-context-grid"
        >

          <ContextCard
            icon={UserRound}
            label="CURRENT PATIENT"
            value={patient.name}
            accent={COLORS.primary}
          />

          <ContextCard
            icon={Database}
            label="KNOWLEDGE SOURCE"
            value="Medical Records"
            accent={COLORS.purple}
          />

          <ContextCard
            icon={ShieldCheck}
            label="AI MODE"
            value="RAG Assisted"
            accent={COLORS.success}
          />

        </div>

      )}


      {/* ===================================================== */}
      {/* ERROR                                                  */}
      {/* ===================================================== */}

      {error && (

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 16px",
            marginBottom: "16px",
            background:
              COLORS.dangerSoft,
            border:
              "1px solid rgba(255,116,116,0.22)",
            borderRadius: "14px",
            color:
              COLORS.danger,
            fontSize: "12px"
          }}
        >
          <AlertCircle size={17} />
          {error}
        </div>

      )}


      {/* ===================================================== */}
      {/* MAIN AI WORKSPACE                                      */}
      {/* ===================================================== */}

      <section
        style={{
          background:
            "linear-gradient(145deg, #0B1C1A, #081513)",
          border:
            `1px solid ${COLORS.border}`,
          borderRadius: "22px",
          overflow: "hidden",
          boxShadow:
            "0 15px 50px rgba(0,0,0,0.16)"
        }}
      >

        {/* Workspace top bar */}
        <div
          style={{
            padding:
              "15px 20px",
            borderBottom:
              `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "15px",
            flexWrap: "wrap"
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px"
            }}
          >

            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "9px",
                background:
                  COLORS.primarySoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Sparkles
                size={15}
                color={COLORS.primary}
              />
            </div>

            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing:
                  "1px"
              }}
            >
              AI CONVERSATION
            </span>

          </div>


          <button
            type="button"
            onClick={clearChat}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding:
                "8px 11px",
              border:
                `1px solid ${COLORS.border}`,
              borderRadius: "9px",
              background:
                "rgba(255,255,255,0.025)",
              color:
                COLORS.muted,
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              fontSize: "10px",
              fontWeight: "700"
            }}
          >
            <Trash2 size={13} />
            Clear chat
          </button>

        </div>


        {/* =================================================== */}
        {/* WELCOME PANEL                                        */}
        {/* =================================================== */}

        {messages.length === 1 &&
          !loading && (
            <div
              style={{
                padding:
                  "34px 25px 25px",
                textAlign: "center",
                borderBottom:
                  `1px solid ${COLORS.border}`
              }}
            >

              <div
                style={{
                  width: "58px",
                  height: "58px",
                  margin:
                    "0 auto 15px",
                  borderRadius: "18px",
                  background:
                    "linear-gradient(145deg, rgba(32,199,181,0.16), rgba(155,138,251,0.10))",
                  border:
                    "1px solid rgba(32,199,181,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Bot
                  size={27}
                  color={COLORS.primary}
                />
              </div>


              <div
                style={{
                  fontSize: "10px",
                  color:
                    COLORS.primary,
                  fontWeight: "800",
                  letterSpacing:
                    "1.7px"
                }}
              >
                MEDIORA AI
              </div>


              <h2
                style={{
                  margin:
                    "7px 0 7px",
                  fontSize: "22px",
                  fontWeight: "800"
                }}
              >
                Understand the record.
              </h2>


              <p
                style={{
                  margin: "0 auto",
                  maxWidth: "530px",
                  color:
                    COLORS.muted,
                  fontSize: "12px",
                  lineHeight: 1.7
                }}
              >
                Ask a question below or choose
                one of the suggested questions to
                explore the patient's medical data.
              </p>


              {/* Suggested questions */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",
                  gap: "8px",
                  maxWidth: "780px",
                  margin:
                    "22px auto 0"
                }}
                className="ai-suggestion-grid"
              >

                {suggestedQuestions.map(
                  item => {

                    const Icon =
                      item.icon;

                    return (

                      <button
                        key={
                          item.question
                        }
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleSuggestedQuestion(
                            item.question
                          )
                        }
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          minHeight:
                            "78px",
                          border:
                            `1px solid ${COLORS.border}`,
                          borderRadius:
                            "13px",
                          background:
                            "rgba(255,255,255,0.018)",
                          color:
                            COLORS.text,
                          cursor:
                            loading
                              ? "not-allowed"
                              : "pointer",
                          transition:
                            "0.2s ease"
                        }}
                      >

                        <div
                          style={{
                            width: "27px",
                            height: "27px",
                            borderRadius:
                              "8px",
                            background:
                              COLORS.primarySoft,
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            marginBottom:
                              "9px"
                          }}
                        >
                          <Icon
                            size={14}
                            color={
                              COLORS.primary
                            }
                          />
                        </div>

                        <div
                          style={{
                            fontSize:
                              "11px",
                            fontWeight:
                              "800"
                          }}
                        >
                          {item.title}
                        </div>

                        <ChevronRight
                          size={13}
                          color={
                            COLORS.mutedDark
                          }
                          style={{
                            float: "right",
                            marginTop:
                              "-14px"
                          }}
                        />

                      </button>

                    );

                  }
                )}

              </div>

            </div>
          )}


        {/* =================================================== */}
        {/* MESSAGES                                             */}
        {/* =================================================== */}

        <div
          style={{
            padding:
              messages.length === 1
                ? "0 25px"
                : "24px 25px",
            maxHeight:
              "min(600px, 58vh)",
            overflowY:
              "auto"
          }}
          className="ai-message-area"
        >

          {messages.map(
            message => {

              const isAI =
                message.role === "ai";

              const sources =
                isAI
                  ? getUniqueSources(
                      message.sources
                    )
                  : [];

              return (

                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    gap: "11px",
                    marginBottom: "22px",
                    justifyContent:
                      isAI
                        ? "flex-start"
                        : "flex-end"
                  }}
                >

                  {/* AI avatar */}
                  {isAI && (
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        flexShrink: 0,
                        borderRadius: "11px",
                        background:
                          COLORS.primarySoft,
                        border:
                          "1px solid rgba(32,199,181,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center"
                      }}
                    >
                      <Bot
                        size={17}
                        color={
                          COLORS.primary
                        }
                      />
                    </div>
                  )}


                  <div
                    style={{
                      maxWidth:
                        isAI
                          ? "82%"
                          : "70%"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "6px",
                        marginBottom:
                          "6px",
                        color:
                          COLORS.mutedDark,
                        fontSize: "9px",
                        fontWeight:
                          "800",
                        letterSpacing:
                          "0.8px",
                        justifyContent:
                          isAI
                            ? "flex-start"
                            : "flex-end"
                      }}
                    >

                      {isAI
                        ? "MEDIORA AI"
                        : "YOU"}

                    </div>


                    <div
                      style={{
                        padding:
                          "14px 16px",
                        borderRadius:
                          isAI
                            ? "5px 16px 16px 16px"
                            : "16px 5px 16px 16px",
                        background:
                          isAI
                            ? COLORS.panel2
                            : COLORS.userBubble,
                        border:
                          `1px solid ${
                            isAI
                              ? COLORS.border
                              : "#205149"
                          }`,
                        color:
                          COLORS.text,
                        fontSize: "13px",
                        lineHeight: 1.75
                      }}
                    >

                      {isAI ? (

                        <div
                          style={{
                            color:
                              COLORS.text
                          }}
                        >
                          <ReactMarkdown>
                            {message.text}
                          </ReactMarkdown>
                        </div>

                      ) : (

                        <p
                          style={{
                            margin: 0
                          }}
                        >
                          {message.text}
                        </p>

                      )}

                    </div>


                    {/* SOURCES */}
                    {isAI &&
                      sources.length >
                        0 && (

                        <div
                          style={{
                            marginTop:
                              "9px",
                            padding:
                              "12px",
                            borderRadius:
                              "13px",
                            background:
                              "rgba(155,138,251,0.045)",
                            border:
                              "1px solid rgba(155,138,251,0.15)"
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "6px",
                              color:
                                COLORS.purple,
                              fontSize:
                                "9px",
                              fontWeight:
                                "800",
                              letterSpacing:
                                "1px",
                              marginBottom:
                                "9px"
                            }}
                          >
                            <BookOpen
                              size={13}
                            />

                            RETRIEVED MEDICAL SOURCES
                          </div>


                          <div
                            style={{
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              gap: "7px"
                            }}
                          >

                            {sources.map(
                              source => (

                                <div
                                  key={
                                    `source-${source.document_id}`
                                  }
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "9px",
                                    padding:
                                      "9px",
                                    borderRadius:
                                      "10px",
                                    background:
                                      "rgba(255,255,255,0.025)",
                                    border:
                                      `1px solid ${COLORS.border}`
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
                                        COLORS.purpleSoft,
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center"
                                    }}
                                  >
                                    <FileText
                                      size={
                                        14
                                      }
                                      color={
                                        COLORS.purple
                                      }
                                    />
                                  </div>


                                  <div
                                    style={{
                                      minWidth:
                                        0,
                                      flex: 1
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
                                    >
                                      {source.filename ||
                                        "Medical document"}
                                    </div>

                                    <div
                                      style={{
                                        marginTop:
                                          "3px",
                                        color:
                                          COLORS.mutedDark,
                                        fontSize:
                                          "9px"
                                      }}
                                    >
                                      {source.document_type ||
                                        "Medical Record"}

                                      {source.uploaded_at &&
                                        ` · ${formatSourceDate(
                                          source.uploaded_at
                                        )}`}
                                    </div>

                                  </div>


                                  <button
                                    type="button"
                                    title="View medical document"
                                    aria-label="View medical document"
                                    onClick={() =>
                                      viewSource(
                                        source
                                      )
                                    }
                                    style={{
                                      width:
                                        "29px",
                                      height:
                                        "29px",
                                      flexShrink:
                                        0,
                                      border:
                                        `1px solid ${COLORS.border}`,
                                      background:
                                        "rgba(255,255,255,0.025)",
                                      color:
                                        COLORS.muted,
                                      borderRadius:
                                        "8px",
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
                                    <ExternalLink
                                      size={
                                        13
                                      }
                                    />
                                  </button>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      )}

                  </div>


                  {/* User avatar */}
                  {!isAI && (
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        flexShrink: 0,
                        borderRadius: "11px",
                        background:
                          "#163832",
                        border:
                          "1px solid #25534B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center"
                      }}
                    >
                      <UserRound
                        size={17}
                        color={
                          COLORS.primary
                        }
                      />
                    </div>
                  )}

                </div>

              );

            }
          )}


          {/* ================================================= */}
          {/* TYPING INDICATOR                                   */}
          {/* ================================================= */}

          {loading && (

            <div
              style={{
                display: "flex",
                gap: "11px",
                alignItems:
                  "flex-start",
                marginBottom: "12px"
              }}
            >

              <div
                style={{
                  width: "34px",
                  height: "34px",
                  flexShrink: 0,
                  borderRadius: "11px",
                  background:
                    COLORS.primarySoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center"
                }}
              >
                <Bot
                  size={17}
                  color={
                    COLORS.primary
                  }
                />
              </div>


              <div>

                <div
                  style={{
                    color:
                      COLORS.mutedDark,
                    fontSize: "9px",
                    fontWeight: "800",
                    letterSpacing:
                      "0.8px",
                    marginBottom:
                      "6px"
                  }}
                >
                  MEDIORA AI
                </div>


                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "5px",
                    padding:
                      "14px 17px",
                    borderRadius:
                      "5px 16px 16px 16px",
                    background:
                      COLORS.panel2,
                    border:
                      `1px solid ${COLORS.border}`
                  }}
                >

                  <TypingDot delay="0s" />
                  <TypingDot delay="0.15s" />
                  <TypingDot delay="0.3s" />

                  <span
                    style={{
                      marginLeft:
                        "6px",
                      color:
                        COLORS.mutedDark,
                      fontSize: "10px"
                    }}
                  >
                    Analyzing records...
                  </span>

                </div>

              </div>

            </div>

          )}

          <div
            ref={messagesEndRef}
          />

        </div>


        {/* =================================================== */}
        {/* INPUT                                                */}
        {/* =================================================== */}

        <div
          style={{
            padding:
              "16px 20px 19px",
            borderTop:
              `1px solid ${COLORS.border}`,
            background:
              "rgba(4,12,11,0.35)"
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "9px",
              padding: "8px",
              border:
                `1px solid ${COLORS.borderStrong}`,
              borderRadius: "15px",
              background:
                "#071613",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.015)"
            }}
          >

            <div
              style={{
                padding:
                  "8px 7px",
                color:
                  COLORS.primary
              }}
            >
              <Sparkles
                size={17}
              />
            </div>


            <textarea
              value={question}
              onChange={
                event =>
                  setQuestion(
                    event.target.value
                  )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder={
                patient
                  ? `Ask Mediora about ${patient.name}'s medical records...`
                  : "Ask a question about the patient's medical records..."
              }
              rows={2}
              disabled={loading}
              style={{
                flex: 1,
                minWidth: 0,
                resize: "none",
                border: "none",
                outline: "none",
                background:
                  "transparent",
                color:
                  COLORS.text,
                fontFamily:
                  "inherit",
                fontSize: "13px",
                lineHeight: 1.6,
                padding:
                  "6px 2px"
              }}
            />


            <button
              type="button"
              disabled={
                loading ||
                !question.trim()
              }
              onClick={() =>
                sendMessage()
              }
              title="Send message"
              style={{
                width: "42px",
                height: "42px",
                flexShrink: 0,
                border: "none",
                borderRadius: "12px",
                background:
                  loading ||
                  !question.trim()
                    ? "#17302C"
                    : COLORS.primary,
                color:
                  loading ||
                  !question.trim()
                    ? COLORS.mutedDark
                    : "#061412",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                cursor:
                  loading ||
                  !question.trim()
                    ? "not-allowed"
                    : "pointer"
              }}
            >
              <Send
                size={17}
              />
            </button>

          </div>


          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "10px",
              marginTop: "9px",
              color:
                COLORS.mutedDark,
              fontSize: "9px",
              flexWrap: "wrap"
            }}
          >

            <span>
              Press Enter to send • Shift + Enter
              for a new line
            </span>

            <span
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "5px"
              }}
            >
              <ShieldCheck
                size={11}
              />
              Patient-context aware
            </span>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* DISCLAIMER                                             */}
      {/* ===================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          marginTop: "13px",
          padding:
            "11px 13px",
          color:
            COLORS.mutedDark,
          fontSize: "9px",
          lineHeight: 1.6
        }}
      >
        <ShieldCheck
          size={13}
          style={{
            flexShrink: 0,
            marginTop: "1px"
          }}
        />

        <span>
          Mediora AI provides information from
          uploaded medical records and is not a
          substitute for professional medical
          advice.
        </span>
      </div>


      {/* ===================================================== */}
      {/* RESPONSIVE STYLES                                      */}
      {/* ===================================================== */}

      <style>
        {`
          @keyframes aiPulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(0.85);
            }

            50% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @media (max-width: 900px) {
            .ai-context-grid {
              grid-template-columns: 1fr 1fr !important;
            }

            .ai-suggestion-grid {
              grid-template-columns: 1fr 1fr !important;
            }
          }

          @media (max-width: 620px) {
            .ai-context-grid {
              grid-template-columns: 1fr !important;
            }

            .ai-suggestion-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

    </div>

  );
}


/* ========================================================= */
/* STAT BOX                                                    */
/* ========================================================= */

function StatBox({
  icon: Icon,
  value,
  label
}) {
  return (
    <div
      style={{
        minWidth: "90px",
        padding: "11px 13px",
        border:
          `1px solid ${COLORS.borderStrong}`,
        background:
          "rgba(32,199,181,0.055)",
        borderRadius: "13px"
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color:
            COLORS.primary
        }}
      >
        <Icon size={13} />

        <strong
          style={{
            fontSize: "17px"
          }}
        >
          {value}
        </strong>
      </div>

      <div
        style={{
          color:
            COLORS.mutedDark,
          fontSize: "9px",
          marginTop: "2px"
        }}
      >
        {label}
      </div>

    </div>
  );
}


/* ========================================================= */
/* CONTEXT CARD                                                */
/* ========================================================= */

function ContextCard({
  icon: Icon,
  label,
  value,
  accent
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "13px 15px",
        background:
          COLORS.panel,
        border:
          `1px solid ${COLORS.border}`,
        borderRadius: "14px"
      }}
    >

      <div
        style={{
          width: "32px",
          height: "32px",
          flexShrink: 0,
          borderRadius: "9px",
          background:
            `${accent}14`,
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center"
        }}
      >
        <Icon
          size={15}
          color={accent}
        />
      </div>

      <div
        style={{
          minWidth: 0
        }}
      >

        <div
          style={{
            fontSize: "8px",
            fontWeight: "800",
            letterSpacing:
              "1px",
            color:
              COLORS.mutedDark
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: "3px",
            fontSize: "11px",
            fontWeight: "800",
            color:
              COLORS.text,
            whiteSpace:
              "nowrap",
            overflow:
              "hidden",
            textOverflow:
              "ellipsis"
          }}
        >
          {value}
        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* TYPING DOT                                                  */
/* ========================================================= */

function TypingDot({
  delay
}) {
  return (
    <span
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background:
          COLORS.primary,
        animation:
          "aiPulse 1.1s infinite ease-in-out",
        animationDelay:
          delay
      }}
    />
  );
}