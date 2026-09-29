import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  Bot,
  LogOut,
  ShieldCheck,
  Users,
  Upload,
  ChevronDown,
  ArrowRight,
  Sparkles,
  LockKeyhole
} from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // =====================================================
  // LOAD LOGGED-IN PATIENT
  // =====================================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("mediora_user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedData =
        JSON.parse(storedUser);

      if (!parsedData.user) {
        navigate("/");
        return;
      }

      if (
        parsedData.user.role !==
        "patient"
      ) {
        navigate("/");
        return;
      }

      if (!parsedData.user.patient_id) {
        navigate("/");
        return;
      }

      setUser(parsedData.user);

      // Store patient's own record
      // so Reports and Chat can use it.
      localStorage.setItem(
        "selectedPatient",
        JSON.stringify({
          id: parsedData.user.patient_id,
          name: parsedData.user.name
        })
      );
    } catch {
      localStorage.removeItem(
        "mediora_user"
      );

      navigate("/");
    }
  }, [navigate]);

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem(
      "mediora_user"
    );

    localStorage.removeItem(
      "selectedPatient"
    );

    navigate("/");
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#071413",
          color: "#ecf8f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            '"DM Sans", Arial, sans-serif'
        }}
      >
        <div
          style={{
            textAlign: "center"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background:
                "linear-gradient(135deg, #20c7b5, #0e9487)",
              color: "#071413",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "800",
              margin: "0 auto 16px"
            }}
          >
            M
          </div>

          <div
            style={{
              color: "#91aaa6",
              fontSize: "13px"
            }}
          >
            Loading your workspace...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PATIENT INITIAL
  // =====================================================

  const patientInitial =
    user.name
      ? user.name
          .charAt(0)
          .toUpperCase()
      : "P";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#071413",
        color: "#ecf8f6",
        fontFamily:
          '"DM Sans", Arial, sans-serif',
        overflowX: "hidden"
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <header
        style={{
          height: "76px",
          borderBottom:
            "1px solid #1c3834",
          background:
            "rgba(7, 20, 19, 0.96)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 34px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter:
            "blur(14px)"
        }}
      >

        {/* BRAND */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >

          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "13px",
              background:
                "linear-gradient(135deg, #20c7b5, #0e9487)",
              color: "#071413",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "21px",
              fontWeight: "800",
              boxShadow:
                "0 8px 25px rgba(32,199,181,0.14)"
            }}
          >
            M
          </div>

          <div>

            <div
              style={{
                fontFamily:
                  '"Manrope", Arial, sans-serif',
                fontSize: "20px",
                lineHeight: "1",
                fontWeight: "800",
                color: "#ecf8f6"
              }}
            >
              Mediora
            </div>

            <div
              style={{
                marginTop: "5px",
                fontSize: "9px",
                letterSpacing: "2px",
                fontWeight: "700",
                color: "#6f8d88",
                textTransform:
                  "uppercase"
              }}
            >
              Medical Intelligence
            </div>

          </div>

        </div>

        {/* PATIENT MENU */}

        <div
          style={{
          position: "relative",
          zIndex: 9999
        }}
        >

          <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert("PROFILE BUTTON CLICKED");
            console.log("PROFILE BUTTON CLICKED");

            setMenuOpen((previous) => !previous);
          }}
          style={{
            border: "1px solid #1c3834",
            background: menuOpen
              ? "#102825"
              : "#0d1f1d",
            padding: "7px 10px 7px 8px",
            borderRadius: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#ecf8f6",
            position: "relative",
            zIndex: 300
          }}
        >

            {/* AVATAR */}

            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background:
                  "#103b36",
                border:
                  "1px solid #1a514a",
                color: "#20c7b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "15px"
              }}
            >
              {patientInitial}
            </div>

            {/* USER */}

            <div
              style={{
                textAlign: "left",
                minWidth: "120px"
              }}
            >

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "800",
                  color: "#ecf8f6"
                }}
              >
                {user.name}
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "9px",
                  color: "#78938e"
                }}
              >
                Patient
              </div>

            </div>

            <ChevronDown
              size={17}
              style={{
                color: "#78938e",
                transition:
                  "transform 0.2s",
                transform:
                  menuOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)"
              }}
            />

          </button>

          {/* =================================================
              DROPDOWN
          ================================================= */}

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "58px",
                right: 0,
                width: "230px",
                background: "#0d1f1d",
                border:
                  "1px solid #1c3834",
                borderRadius: "15px",
                boxShadow:
                  "0 20px 45px rgba(0,0,0,0.38)",
                padding: "8px",
                zIndex: 1000
              }}
            >

              {/* UPLOAD */}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/upload");
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background:
                    "transparent",
                  padding: "12px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                  color: "#c9dcda",
                  fontSize: "12px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "#12332f";
                  e.currentTarget.style.color =
                    "#20c7b5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "transparent";
                  e.currentTarget.style.color =
                    "#c9dcda";
                }}
              >
                <Upload size={17} />
                Upload Medical Report
              </button>

              {/* REPORTS */}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/report");
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background:
                    "transparent",
                  padding: "12px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                  color: "#c9dcda",
                  fontSize: "12px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "#12332f";
                  e.currentTarget.style.color =
                    "#20c7b5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "transparent";
                  e.currentTarget.style.color =
                    "#c9dcda";
                }}
              >
                <FileText size={17} />
                My Reports
              </button>

              {/* AI */}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/chat");
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background:
                    "transparent",
                  padding: "12px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                  color: "#c9dcda",
                  fontSize: "12px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "#12332f";
                  e.currentTarget.style.color =
                    "#9b8afb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "transparent";
                  e.currentTarget.style.color =
                    "#c9dcda";
                }}
              >
                <Bot size={17} />
                Mediora AI
              </button>

              {/* DOCTORS */}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/doctors");
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background:
                    "transparent",
                  padding: "12px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                  color: "#c9dcda",
                  fontSize: "12px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "#12332f";
                  e.currentTarget.style.color =
                    "#20c7b5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "transparent";
                  e.currentTarget.style.color =
                    "#c9dcda";
                }}
              >
                <Users size={17} />
                Doctors
              </button>

              <div
                style={{
                  height: "1px",
                  background:
                    "#1c3834",
                  margin:
                    "6px 4px"
                }}
              />

              {/* LOGOUT */}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background:
                    "transparent",
                  padding: "12px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                  color: "#ef8e8e",
                  fontSize: "12px"
                }}
              >
                <LogOut size={17} />
                Logout
              </button>

            </div>
          )}

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        style={{
          width: "100%",
          maxWidth: "1220px",
          margin: "0 auto",
          padding:
            "46px 28px 60px"
        }}
      >

        {/* =================================================
            HERO
        ================================================= */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 340px",
            gap: "25px",
            marginBottom: "28px"
          }}
        >

          {/* HERO TEXT */}

          <div
            style={{
              padding:
                "8px 0"
            }}
          >

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: "#20c7b5",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "2px",
                marginBottom: "14px"
              }}
            >
              <Sparkles size={14} />
              PATIENT WORKSPACE
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily:
                  '"Manrope", Arial, sans-serif',
                fontSize:
                  "clamp(34px, 4vw, 52px)",
                lineHeight: "1.08",
                letterSpacing:
                  "-1.8px",
                color: "#ecf8f6"
              }}
            >
              Welcome,{" "}
              <span
                style={{
                  color: "#20c7b5"
                }}
              >
                {user.name}
              </span>
            </h1>

            <p
              style={{
                maxWidth: "610px",
                margin:
                  "17px 0 0",
                color: "#91aaa6",
                fontSize: "14px",
                lineHeight: "1.8"
              }}
            >
              Your medical information,
              reports, doctor access and
              AI assistance are organized
              in one secure workspace.
            </p>

          </div>

          {/* SECURITY CARD */}

          <div
            style={{
              padding: "22px",
              borderRadius: "18px",
              border:
                "1px solid #1c3834",
              background:
                "linear-gradient(145deg, #0d2421, #0b1c1a)"
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "14px"
              }}
            >

              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background:
                    "#103b36",
                  color: "#20c7b5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <ShieldCheck
                  size={20}
                />
              </div>

              <div>
                <div
                  style={{
                    color: "#ecf8f6",
                    fontSize: "12px",
                    fontWeight: "800"
                  }}
                >
                  Secure Workspace
                </div>

                <div
                  style={{
                    marginTop: "3px",
                    color: "#6e8984",
                    fontSize: "9px"
                  }}
                >
                  Patient data protection
                </div>
              </div>

            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                color: "#6fd8cc",
                fontSize: "10px"
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#20c7b5",
                  boxShadow:
                    "0 0 10px rgba(32,199,181,0.55)"
                }}
              />
              Your account is protected
            </div>

          </div>

        </section>

        {/* =================================================
            ACTIVE PATIENT
        ================================================= */}

        <section
          style={{
            border:
              "1px solid #1c3834",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, #0d211f, #0b1c1a)",
            padding: "27px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px"
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "17px"
            }}
          >

            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, #123f39, #0d2925)",
                border:
                  "1px solid #1a514a",
                color: "#20c7b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily:
                  '"Manrope", Arial, sans-serif',
                fontSize: "26px",
                fontWeight: "800"
              }}
            >
              {patientInitial}
            </div>

            <div>

              <div
                style={{
                  color: "#20c7b5",
                  fontSize: "9px",
                  letterSpacing: "2px",
                  fontWeight: "800",
                  marginBottom: "7px"
                }}
              >
                ACTIVE PATIENT
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#ecf8f6",
                  fontFamily:
                    '"Manrope", Arial, sans-serif',
                  fontSize: "21px"
                }}
              >
                {user.name}
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#78938e",
                  fontSize: "11px"
                }}
              >
                Patient ID{" "}
                {user.patient_id}
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              navigate("/doctors")
            }
            style={{
              height: "43px",
              padding:
                "0 17px",
              border:
                "1px solid #245049",
              borderRadius: "10px",
              background:
                "#102825",
              color: "#20c7b5",
              fontFamily:
                "inherit",
              fontSize: "11px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            Find a Doctor
            <ArrowRight
              size={15}
            />
          </button>

        </section>

        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <div
          style={{
            marginBottom: "13px"
          }}
        >

          <div
            style={{
              color: "#6f8d88",
              fontSize: "9px",
              letterSpacing: "2px",
              fontWeight: "800"
            }}
          >
            QUICK ACCESS
          </div>

        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, 1fr)",
            gap: "16px"
          }}
        >

          {/* UPLOAD */}

          <button
            onClick={() =>
              navigate("/upload")
            }
            style={{
              textAlign: "left",
              border:
                "1px solid #1c3834",
              background:
                "#0d1f1d",
              borderRadius: "17px",
              padding: "22px",
              cursor: "pointer",
              color: "#ecf8f6",
              transition:
                "transform 0.2s ease, border-color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-3px)";
              e.currentTarget.style.borderColor =
                "#296057";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
              e.currentTarget.style.borderColor =
                "#1c3834";
            }}
          >

            <div
              style={{
                width: "43px",
                height: "43px",
                borderRadius: "12px",
                background:
                  "#103b36",
                color: "#20c7b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Upload
                size={21}
              />
            </div>

            <h3
              style={{
                margin:
                  "17px 0 7px",
                fontSize: "14px",
                fontFamily:
                  '"Manrope", Arial, sans-serif'
              }}
            >
              Upload Reports
            </h3>

            <p
              style={{
                margin: 0,
                color: "#718b86",
                fontSize: "10px",
                lineHeight: "1.6"
              }}
            >
              Add medical documents
              securely.
            </p>

            <div
              style={{
                marginTop: "17px",
                color: "#20c7b5",
                fontSize: "10px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              Upload
              <ArrowRight
                size={13}
              />
            </div>

          </button>

          {/* REPORTS */}

          <button
            onClick={() =>
              navigate("/report")
            }
            style={{
              textAlign: "left",
              border:
                "1px solid #1c3834",
              background:
                "#0d1f1d",
              borderRadius: "17px",
              padding: "22px",
              cursor: "pointer",
              color: "#ecf8f6",
              transition:
                "transform 0.2s ease, border-color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-3px)";
              e.currentTarget.style.borderColor =
                "#296057";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
              e.currentTarget.style.borderColor =
                "#1c3834";
            }}
          >

            <div
              style={{
                width: "43px",
                height: "43px",
                borderRadius: "12px",
                background:
                  "#103b36",
                color: "#20c7b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FileText
                size={21}
              />
            </div>

            <h3
              style={{
                margin:
                  "17px 0 7px",
                fontSize: "14px",
                fontFamily:
                  '"Manrope", Arial, sans-serif'
              }}
            >
              My Reports
            </h3>

            <p
              style={{
                margin: 0,
                color: "#718b86",
                fontSize: "10px",
                lineHeight: "1.6"
              }}
            >
              View your medical
              reports and results.
            </p>

            <div
              style={{
                marginTop: "17px",
                color: "#20c7b5",
                fontSize: "10px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              View reports
              <ArrowRight
                size={13}
              />
            </div>

          </button>

          {/* DOCTORS */}

          <button
            onClick={() =>
              navigate("/doctors")
            }
            style={{
              textAlign: "left",
              border:
                "1px solid #1c3834",
              background:
                "#0d1f1d",
              borderRadius: "17px",
              padding: "22px",
              cursor: "pointer",
              color: "#ecf8f6",
              transition:
                "transform 0.2s ease, border-color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-3px)";
              e.currentTarget.style.borderColor =
                "#296057";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
              e.currentTarget.style.borderColor =
                "#1c3834";
            }}
          >

            <div
              style={{
                width: "43px",
                height: "43px",
                borderRadius: "12px",
                background:
                  "#103b36",
                color: "#20c7b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Users
                size={21}
              />
            </div>

            <h3
              style={{
                margin:
                  "17px 0 7px",
                fontSize: "14px",
                fontFamily:
                  '"Manrope", Arial, sans-serif'
              }}
            >
              Doctors
            </h3>

            <p
              style={{
                margin: 0,
                color: "#718b86",
                fontSize: "10px",
                lineHeight: "1.6"
              }}
            >
              Check availability and
              ask doctors questions.
            </p>

            <div
              style={{
                marginTop: "17px",
                color: "#20c7b5",
                fontSize: "10px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              Find doctors
              <ArrowRight
                size={13}
              />
            </div>

          </button>

          {/* AI */}

          <button
            onClick={() =>
              navigate("/chat")
            }
            style={{
              textAlign: "left",
              border:
                "1px solid #342d56",
              background:
                "linear-gradient(145deg, #15152a, #0d1f1d)",
              borderRadius: "17px",
              padding: "22px",
              cursor: "pointer",
              color: "#ecf8f6",
              transition:
                "transform 0.2s ease, border-color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-3px)";
              e.currentTarget.style.borderColor =
                "#5d4f92";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
              e.currentTarget.style.borderColor =
                "#342d56";
            }}
          >

            <div
              style={{
                width: "43px",
                height: "43px",
                borderRadius: "12px",
                background:
                  "#272044",
                color: "#9b8afb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Bot
                size={21}
              />
            </div>

            <h3
              style={{
                margin:
                  "17px 0 7px",
                fontSize: "14px",
                fontFamily:
                  '"Manrope", Arial, sans-serif'
              }}
            >
              Mediora AI
            </h3>

            <p
              style={{
                margin: 0,
                color: "#8d899f",
                fontSize: "10px",
                lineHeight: "1.6"
              }}
            >
              Ask questions about
              your medical records.
            </p>

            <div
              style={{
                marginTop: "17px",
                color: "#9b8afb",
                fontSize: "10px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              Ask Mediora AI
              <ArrowRight
                size={13}
              />
            </div>

          </button>

        </section>

        {/* =================================================
            AI FEATURE PANEL
        ================================================= */}

        <section
          style={{
            marginTop: "28px",
            padding: "25px",
            borderRadius: "19px",
            border:
              "1px solid #302a51",
            background:
              "linear-gradient(120deg, #111629, #0d1f1d)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "25px"
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "17px"
            }}
          >

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background:
                  "#272044",
                color: "#9b8afb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Bot size={23} />
            </div>

            <div>

              <div
                style={{
                  color: "#9b8afb",
                  fontSize: "9px",
                  letterSpacing: "1.8px",
                  fontWeight: "800",
                  marginBottom: "5px"
                }}
              >
                MEDICAL INTELLIGENCE
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#ecf8f6",
                  fontFamily:
                    '"Manrope", Arial, sans-serif',
                  fontSize: "16px"
                }}
              >
                Understand your medical
                information with AI
              </h3>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#78838f",
                  fontSize: "10px"
                }}
              >
                Ask Mediora questions
                using your available
                medical records.
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              navigate("/chat")
            }
            style={{
              height: "42px",
              padding:
                "0 17px",
              border: "1px solid #51477e",
              borderRadius: "10px",
              background:
                "#1b1830",
              color: "#9b8afb",
              fontFamily:
                "inherit",
              fontSize: "10px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0
            }}
          >
            Open AI Assistant
            <ArrowRight
              size={14}
            />
          </button>

        </section>

        {/* =================================================
            PRIVACY NOTICE
        ================================================= */}

        <section
          style={{
            marginTop: "18px",
            padding:
              "16px 19px",
            border:
              "1px solid #193631",
            borderRadius: "13px",
            background:
              "#091a18",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >

          <LockKeyhole
            size={17}
            style={{
              color: "#20c7b5",
              flexShrink: 0
            }}
          />

          <div>

            <div
              style={{
                color: "#a9c2be",
                fontSize: "10px",
                fontWeight: "800"
              }}
            >
              Privacy first
            </div>

            <div
              style={{
                marginTop: "3px",
                color: "#607b76",
                fontSize: "9px"
              }}
            >
              Your medical workspace is
              protected by secure access
              controls.
            </div>

          </div>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          style={{
            marginTop: "32px",
            paddingTop: "20px",
            borderTop:
              "1px solid #142b28",
            display: "flex",
            justifyContent:
              "space-between",
            color: "#526c67",
            fontSize: "9px"
          }}
        >

          <span>
            Mediora Health Intelligence
          </span>

          <span>
            Secure Clinical Workspace
          </span>

        </footer>

      </main>

      {/* =================================================
          RESPONSIVE STYLE
      ================================================= */}

      <style>{`

        @media (max-width: 900px) {

          header {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          main {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          main > section:first-child {
            grid-template-columns: 1fr !important;
          }

          main section[style*="repeat(4"] {
            grid-template-columns:
              repeat(2, 1fr) !important;
          }

        }

        @media (max-width: 600px) {

          header {
            height: 68px !important;
          }

          header > div:last-child
            button > div:nth-child(2) {
            display: none !important;
          }

          main {
            padding-top: 30px !important;
          }

          main section[style*="repeat(4"] {
            grid-template-columns:
              1fr !important;
          }

          main section[style*="justify-content: space-between"] {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          main section[style*="justify-content: space-between"]
            > button {
            width: 100% !important;
            justify-content: center !important;
          }

          footer {
            flex-direction: column !important;
            gap: 7px !important;
          }

        }

      `}</style>

    </div>
  );
}