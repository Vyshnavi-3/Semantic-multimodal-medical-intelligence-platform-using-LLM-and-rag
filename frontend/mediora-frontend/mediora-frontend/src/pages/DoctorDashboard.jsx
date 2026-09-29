import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  FileText,
  Bot,
  LogOut,
  ShieldCheck,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  RefreshCw,
  Upload,
  Activity,
  Circle,
  Stethoscope,
  ArrowRight,
  UserRound,
  ChevronRight
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

  purple: "#9B8AFB",
  blue: "#5C9DFF",
  orange: "#F4A64A",

  text: "#ECF8F6",
  secondary: "#91AAA6",
  muted: "#607A75",

  success: "#42D6A7",
  danger: "#FF7474"
};


/* ========================================================= */
/* COMPONENT                                                   */
/* ========================================================= */

export default function DoctorDashboard() {

  const navigate = useNavigate();


  /* ========================================================= */
  /* STATE                                                       */
  /* ========================================================= */

  const [user, setUser] =
    useState(null);
  const [specialization, setSpecialization] = useState("");
  const [savingSpecialization, setSavingSpecialization] = useState(false);
  const [specializationMessage, setSpecializationMessage] = useState("");

  const [enquiries, setEnquiries] =
    useState([]);

  const [loadingEnquiries, setLoadingEnquiries] =
    useState(false);

  const [selectedEnquiry, setSelectedEnquiry] =
    useState(null);

  const [responseText, setResponseText] =
    useState("");

  const [sendingResponse, setSendingResponse] =
    useState(false);

  const [enquiryError, setEnquiryError] =
    useState("");

  const [enquirySuccess, setEnquirySuccess] =
    useState("");


  /* ========================================================= */
  /* LOAD LOGGED-IN USER                                         */
  /* ========================================================= */

  useEffect(() => {

    const storedUser =
      localStorage.getItem(
        "mediora_user"
      );


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
        "doctor"
      ) {

        navigate("/");

        return;

      }


      setUser(
        parsedData.user
      );

    } catch (error) {

      console.error(
        "Doctor authentication error:",
        error
      );


      localStorage.removeItem(
        "mediora_user"
      );


      navigate("/");

    }

  }, [navigate]);
  useEffect(() => {

  if (user?.specialization) {
    setSpecialization(user.specialization);
  }

}, [user]);

  /* ========================================================= */
  /* LOAD DOCTOR ENQUIRIES                                       */
  /* ========================================================= */

  useEffect(() => {

    if (!user?.id) {
      return;
    }

    fetchEnquiries();

  }, [user]);


  async function fetchEnquiries() {

    if (!user?.id) {
      return;
    }


    try {

      setLoadingEnquiries(true);
      setEnquiryError("");


      const response =
        await fetch(
          `http://127.0.0.1:8000/doctors/enquiries/doctor/${user.id}`
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Unable to load doctor enquiries."
        );

      }


      setEnquiries(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        "Enquiry loading error:",
        error
      );


      setEnquiryError(
        error.message ||
        "Unable to load enquiries."
      );


    } finally {

      setLoadingEnquiries(false);

    }

  }
  // =====================================================
// UPDATE SPECIALIZATION
// =====================================================

async function updateSpecialization() {
  if (!user?.id) {
    return;
  }

  if (!specialization.trim()) {
    setSpecializationMessage(
      "Please enter your specialization."
    );
    return;
  }

  try {
    setSavingSpecialization(true);
    setSpecializationMessage("");

    const response = await fetch(
      `http://127.0.0.1:8000/doctors/${user.id}/specialization`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          specialization: specialization.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        "Unable to update specialization."
      );
    }

    const updatedUser = {
      ...user,
      specialization:
        specialization.trim()
    };

    setUser(updatedUser);

    const savedUser =
      localStorage.getItem("mediora_user");

    if (savedUser) {
      const parsedData = JSON.parse(savedUser);

      localStorage.setItem(
        "mediora_user",
        JSON.stringify({
          ...parsedData,
          user: updatedUser
        })
      );
    }

    setSpecializationMessage(
      "Specialization updated successfully."
    );

  } catch (error) {
    console.error(
      "Specialization update error:",
      error
    );

    setSpecializationMessage(
      error.message ||
      "Unable to update specialization."
    );

  } finally {
    setSavingSpecialization(false);
  }
}


  /* ========================================================= */
  /* LOGOUT                                                      */
  /* ========================================================= */

  function handleLogout() {

    localStorage.removeItem(
      "mediora_user"
    );

    localStorage.removeItem(
      "selectedPatient"
    );

    navigate("/");

  }


  /* ========================================================= */
  /* OPEN RESPONSE                                               */
  /* ========================================================= */

  function openResponse(enquiry) {

    setSelectedEnquiry(
      enquiry
    );

    setResponseText("");

    setEnquiryError("");

    setEnquirySuccess("");

  }


  /* ========================================================= */
  /* CLOSE RESPONSE                                              */
  /* ========================================================= */

  function closeResponse() {

    if (sendingResponse) {
      return;
    }

    setSelectedEnquiry(null);

    setResponseText("");

    setEnquiryError("");

    setEnquirySuccess("");

  }


  /* ========================================================= */
  /* SEND DOCTOR RESPONSE                                        */
  /* ========================================================= */

  async function submitResponse(event) {

    event.preventDefault();


    if (!selectedEnquiry) {
      return;
    }


    if (!responseText.trim()) {

      setEnquiryError(
        "Please enter a response for the patient."
      );

      return;

    }


    try {

      setSendingResponse(true);

      setEnquiryError("");

      setEnquirySuccess("");


      const response =
        await fetch(
          `http://127.0.0.1:8000/doctors/enquiries/${selectedEnquiry.id}/respond`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              doctor_response:
                responseText.trim()
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Unable to send doctor response."
        );

      }


      setEnquirySuccess(
        "Response sent successfully to the patient."
      );


      setResponseText("");


      await fetchEnquiries();


    } catch (error) {

      console.error(
        "Doctor response error:",
        error
      );


      setEnquiryError(
        error.message ||
        "Unable to send response."
      );


    } finally {

      setSendingResponse(false);

    }

  }


  /* ========================================================= */
  /* STATISTICS                                                  */
  /* ========================================================= */

  const pendingCount =
    useMemo(
      () =>
        enquiries.filter(
          enquiry =>
            enquiry.status ===
            "Pending"
        ).length,
      [enquiries]
    );


  const answeredCount =
    useMemo(
      () =>
        enquiries.filter(
          enquiry =>
            enquiry.status ===
            "Answered"
        ).length,
      [enquiries]
    );


  /* ========================================================= */
  /* LOADING                                                      */
  /* ========================================================= */

  if (!user) {

    return (

      <div
        style={{
          minHeight: "100vh",
          background:
            theme.background,
          color:
            theme.text,
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          fontFamily:
            '"Manrope", "DM Sans", system-ui, sans-serif'
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: "10px",
            color:
              theme.secondary,
            fontSize: "13px"
          }}
        >

          <RefreshCw
            size={17}
            style={{
              animation:
                "spin 1s linear infinite"
            }}
          />

          Loading doctor workspace...

        </div>

      </div>

    );

  }


  /* ========================================================= */
  /* DASHBOARD                                                   */
  /* ========================================================= */

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          theme.background,
        color:
          theme.text,
        fontFamily:
          '"Manrope", "DM Sans", system-ui, sans-serif'
      }}
    >

      {/* ===================================================== */}
      {/* HEADER                                                  */}
      {/* ===================================================== */}

      <header
        style={{
          height: "70px",
          borderBottom:
            `1px solid ${theme.border}`,
          background:
            "rgba(7,20,18,0.92)",
          backdropFilter:
            "blur(16px)",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          padding:
            "0 30px",
          boxSizing:
            "border-box",
          position:
            "sticky",
          top: 0,
          zIndex: 100
        }}
      >

        {/* BRAND */}

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: "11px"
          }}
        >

          <div
            style={{
              width: "39px",
              height: "39px",
              borderRadius:
                "12px",
              background:
                "linear-gradient(145deg, #20C7B5, #0D8F82)",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              color:
                "#061412",
              fontWeight:
                "900",
              fontSize:
                "19px",
              boxShadow:
                "0 8px 25px rgba(32,199,181,0.18)"
            }}
          >
            M
          </div>


          <div>

            <div
              style={{
                fontSize:
                  "17px",
                fontWeight:
                  "800",
                letterSpacing:
                  "-0.3px"
              }}
            >
              Mediora
            </div>

            <div
              style={{
                fontSize:
                  "9px",
                color:
                  theme.muted,
                letterSpacing:
                  "1.2px",
                fontWeight:
                  "700"
              }}
            >
              MEDICAL INTELLIGENCE
            </div>

          </div>

        </div>


        {/* DOCTOR PROFILE */}

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: "13px"
          }}
        >

          <div
            style={{
              textAlign:
                "right"
            }}
          >

            <div
              style={{
                fontSize:
                  "12px",
                fontWeight:
                  "800"
              }}
            >
              {user.name}
            </div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "flex-end",
                gap: "5px",
                color:
                  theme.success,
                fontSize:
                  "9px",
                fontWeight:
                  "700",
                marginTop:
                  "3px"
              }}
            >

              <Circle
                size={6}
                fill="currentColor"
              />

              DOCTOR PORTAL

            </div>

          </div>


          <button
            type="button"
            onClick={handleLogout}
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "7px",
              padding:
                "9px 12px",
              border:
                `1px solid ${theme.border}`,
              borderRadius:
                "9px",
              background:
                "rgba(255,255,255,0.025)",
              color:
                theme.secondary,
              cursor:
                "pointer",
              fontSize:
                "10px",
              fontWeight:
                "700"
            }}
          >

            <LogOut size={14} />

            Logout

          </button>

        </div>

      </header>


      {/* ===================================================== */}
      {/* MAIN                                                     */}
      {/* ===================================================== */}

      <main
        style={{
          width:
            "100%",
          maxWidth:
            "1240px",
          margin:
            "0 auto",
          padding:
            "34px 24px 45px",
          boxSizing:
            "border-box"
        }}
      >


        {/* =================================================== */}
        {/* HERO                                                  */}
        {/* =================================================== */}

        <section
          style={{
            position:
              "relative",
            overflow:
              "hidden",
            background:
              "linear-gradient(135deg, #0C211E 0%, #081614 58%, #102925 100%)",
            border:
              `1px solid ${theme.border}`,
            borderRadius:
              "23px",
            padding:
              "28px",
            marginBottom:
              "18px",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.22)"
          }}
        >

          <div
            style={{
              position:
                "absolute",
              width:
                "280px",
              height:
                "280px",
              borderRadius:
                "50%",
              background:
                "rgba(32,199,181,0.055)",
              right:
                "-100px",
              top:
                "-145px",
              filter:
                "blur(12px)"
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
                "25px",
              flexWrap:
                "wrap"
            }}
          >

            <div>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "7px",
                  color:
                    theme.primary,
                  fontSize:
                    "9px",
                  fontWeight:
                    "900",
                  letterSpacing:
                    "1.8px",
                  marginBottom:
                    "9px"
                }}
              >

                <Stethoscope
                  size={13}
                />

                DOCTOR WORKSPACE

              </div>


              <h1
                style={{
                  margin:
                    0,
                  fontSize:
                    "clamp(26px, 4vw, 35px)",
                  lineHeight:
                    1.12,
                  fontWeight:
                    "850",
                  letterSpacing:
                    "-1.2px"
                }}
              >
                Welcome, {user.name}
              </h1>


              <p
                style={{
                  margin:
                    "10px 0 0",
                  maxWidth:
                    "610px",
                  color:
                    theme.secondary,
                  fontSize:
                    "12px",
                  lineHeight:
                    1.7
                }}
              >
                Manage patients, medical records,
                patient communication and
                AI-assisted clinical insights from
                one secure workspace.
              </p>

            </div>


            {/* STATUS */}

            <div
              style={{
                padding:
                  "13px 15px",
                border:
                  "1px solid rgba(66,214,167,0.18)",
                borderRadius:
                  "14px",
                background:
                  "rgba(66,214,167,0.055)",
                minWidth:
                  "145px"
              }}
            >

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "6px",
                  color:
                    theme.success,
                  fontSize:
                    "9px",
                  fontWeight:
                    "800"
                }}
              >

                <Circle
                  size={7}
                  fill="currentColor"
                />

                SYSTEM STATUS

              </div>


              <div
                style={{
                  marginTop:
                    "7px",
                  fontSize:
                    "13px",
                  fontWeight:
                    "800"
                }}
              >
                Clinical workspace active
              </div>

            </div>

          </div>

        </section>


        {/* =================================================== */}
        {/* STAT STRIP                                             */}
        {/* =================================================== */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap:
              "9px",
            marginBottom:
              "18px"
          }}
          className="doctor-stat-grid"
        >

          <StatCard
            icon={MessageSquare}
            value={enquiries.length}
            label="Total Enquiries"
            accent={theme.primary}
          />

          <StatCard
            icon={Clock}
            value={pendingCount}
            label="Pending Responses"
            accent={theme.orange}
          />

          <StatCard
            icon={CheckCircle}
            value={answeredCount}
            label="Answered"
            accent={theme.success}
          />

        </div>


        {/* =================================================== */}
        {/* QUICK ACCESS                                           */}
        {/* =================================================== */}

        <section>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "flex-end",
              justifyContent:
                "space-between",
              marginBottom:
                "12px"
            }}
          >

            <div>

              <div
                style={{
                  color:
                    theme.primary,
                  fontSize:
                    "9px",
                  fontWeight:
                    "900",
                  letterSpacing:
                    "1.6px"
                }}
              >
                CLINICAL TOOLS
              </div>

              <h2
                style={{
                  margin:
                    "5px 0 0",
                  fontSize:
                    "20px",
                  fontWeight:
                    "800"
                }}
              >
                Quick Access
              </h2>

            </div>

          </div>


          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap:
                "10px"
            }}
            className="doctor-tools-grid"
          >

            <DashboardTool
              icon={Users}
              title="Patients"
              description="View patients and open their clinical workspace."
              accent={theme.primary}
              onClick={() =>
                navigate("/patients")
              }
            />


            <DashboardTool
              icon={FileText}
              title="Documents"
              description="Access uploaded medical records and reports."
              accent={theme.blue}
              onClick={() =>
                navigate("/documents")
              }
            />


            <DashboardTool
              icon={Bot}
              title="AI Assistant"
              description="Ask Mediora about a selected patient's records."
              accent={theme.purple}
              onClick={() =>
                navigate("/chat")
              }
            />

          </div>

        </section>
        {/* =================================================
        DOCTOR SPECIALIZATION
      ================================================= */}

      <div
        style={{
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          borderRadius: "14px",
          padding: "26px"
        }}
      >
        <Activity
          size={30}
          strokeWidth={1.8}
          color="#008f83"
        />

        <h2
          style={{
            margin: "20px 0 8px",
            color: "#111827"
          }}
        >
          My Specialization
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "#6b7280",
            lineHeight: "1.6"
          }}
        >
          Add or update your medical specialization.
        </p>

        <input
          type="text"
          value={specialization}
          onChange={(event) =>
            setSpecialization(event.target.value)
          }
          placeholder="e.g. Cardiology"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "11px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "12px"
          }}
        />

        <button
          type="button"
          onClick={updateSpecialization}
          disabled={savingSpecialization}
          style={{
            border: "none",
            background: "#008f83",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: savingSpecialization
              ? "not-allowed"
              : "pointer",
            fontWeight: "600"
          }}
        >
          {savingSpecialization
            ? "Saving..."
            : "Save Specialization"}
        </button>

        {specializationMessage && (
          <p
            style={{
              marginTop: "12px",
              marginBottom: 0,
              color: "#008f83",
              fontSize: "13px"
            }}
          >
            {specializationMessage}
          </p>
        )}
      </div>


        {/* =================================================== */}
        {/* ENQUIRIES                                             */}
        {/* =================================================== */}

        <section
          style={{
            marginTop:
              "28px"
          }}
        >

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap:
                "15px",
              flexWrap:
                "wrap",
              marginBottom:
                "13px"
            }}
          >

            <div>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "7px",
                  color:
                    theme.primary,
                  fontSize:
                    "9px",
                  fontWeight:
                    "900",
                  letterSpacing:
                    "1.5px"
                }}
              >

                <MessageSquare
                  size={13}
                />

                PATIENT COMMUNICATION

              </div>


              <h2
                style={{
                  margin:
                    "5px 0 0",
                  fontSize:
                    "20px",
                  fontWeight:
                    "800"
                }}
              >
                Patient Enquiries
              </h2>


              <p
                style={{
                  margin:
                    "5px 0 0",
                  color:
                    theme.muted,
                  fontSize:
                    "10px"
                }}
              >
                Respond to questions submitted by your patients.
              </p>

            </div>


            <button
              type="button"
              onClick={fetchEnquiries}
              disabled={
                loadingEnquiries
              }
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "7px",
                padding:
                  "9px 12px",
                border:
                  `1px solid ${theme.border}`,
                borderRadius:
                  "9px",
                background:
                  "rgba(255,255,255,0.025)",
                color:
                  theme.secondary,
                cursor:
                  loadingEnquiries
                    ? "not-allowed"
                    : "pointer",
                fontSize:
                  "10px",
                fontWeight:
                  "700"
              }}
            >

              <RefreshCw
                size={13}
                style={{
                  animation:
                    loadingEnquiries
                      ? "spin 1s linear infinite"
                      : "none"
                }}
              />

              Refresh

            </button>

          </div>


          {/* ERROR */}

          {enquiryError &&
            !selectedEnquiry && (

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "8px",
                  padding:
                    "12px 14px",
                  marginBottom:
                    "12px",
                  borderRadius:
                    "12px",
                  background:
                    "rgba(255,116,116,0.07)",
                  border:
                    "1px solid rgba(255,116,116,0.18)",
                  color:
                    theme.danger,
                  fontSize:
                    "11px"
                }}
              >

                <AlertCircle
                  size={15}
                />

                {enquiryError}

              </div>

            )}


          {/* LOADING */}

          {loadingEnquiries && (

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap:
                  "9px",
                minHeight:
                  "130px",
                background:
                  theme.surface,
                border:
                  `1px solid ${theme.border}`,
                borderRadius:
                  "16px",
                color:
                  theme.secondary,
                fontSize:
                  "11px"
              }}
            >

              <RefreshCw
                size={16}
                style={{
                  animation:
                    "spin 1s linear infinite"
                }}
              />

              Loading patient enquiries...

            </div>

          )}


          {/* EMPTY */}

          {!loadingEnquiries &&
            enquiries.length === 0 &&
            !enquiryError && (

              <div
                style={{
                  padding:
                    "38px 20px",
                  textAlign:
                    "center",
                  background:
                    theme.surface,
                  border:
                    `1px solid ${theme.border}`,
                  borderRadius:
                    "16px"
                }}
              >

                <div
                  style={{
                    width:
                      "45px",
                    height:
                      "45px",
                    margin:
                      "0 auto 12px",
                    borderRadius:
                      "13px",
                    background:
                      "rgba(32,199,181,0.07)",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center"
                  }}
                >

                  <MessageSquare
                    size={20}
                    color={
                      theme.primary
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
                  No patient enquiries
                </h3>


                <p
                  style={{
                    margin:
                      0,
                    color:
                      theme.muted,
                    fontSize:
                      "10px"
                  }}
                >
                  Patient questions will appear here when they contact you.
                </p>

              </div>

            )}


          {/* ENQUIRY LIST */}

          {!loadingEnquiries &&
            enquiries.length > 0 && (

              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap:
                    "10px"
                }}
              >

                {enquiries.map(
                  enquiry => (

                    <EnquiryCard
                      key={
                        enquiry.id
                      }
                      enquiry={
                        enquiry
                      }
                      onRespond={() =>
                        openResponse(
                          enquiry
                        )
                      }
                    />

                  )
                )}

              </div>

            )}

        </section>


        {/* =================================================== */}
        {/* SECURITY                                              */}
        {/* =================================================== */}

        <section
          style={{
            marginTop:
              "25px",
            padding:
              "16px 18px",
            border:
              "1px solid rgba(32,199,181,0.13)",
            borderRadius:
              "14px",
            background:
              "rgba(32,199,181,0.035)",
            display:
              "flex",
            alignItems:
              "flex-start",
            gap:
              "11px"
          }}
        >

          <div
            style={{
              width:
                "31px",
              height:
                "31px",
              flexShrink:
                0,
              borderRadius:
                "9px",
              background:
                "rgba(32,199,181,0.09)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center"
            }}
          >

            <ShieldCheck
              size={16}
              color={
                theme.primary
              }
            />

          </div>


          <div>

            <div
              style={{
                fontSize:
                  "11px",
                fontWeight:
                  "800"
              }}
            >
              Secure clinical workspace
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
              Patient medical information should
              only be accessed for authorized
              patients. Mediora protects the
              clinical workspace through controlled
              access and protected APIs.
            </p>

          </div>

        </section>

      </main>


      {/* ===================================================== */}
      {/* RESPONSE MODAL                                          */}
      {/* ===================================================== */}

      {selectedEnquiry && (

        <div
          style={{
            position:
              "fixed",
            inset:
              0,
            zIndex:
              1000,
            background:
              "rgba(2,8,7,0.78)",
            backdropFilter:
              "blur(8px)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
            boxSizing:
              "border-box"
          }}
        >

          <div
            style={{
              width:
                "100%",
              maxWidth:
                "590px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              background:
                "#0A1917",
              border:
                `1px solid ${theme.borderStrong}`,
              borderRadius:
                "20px",
              padding:
                "23px",
              boxSizing:
                "border-box",
              boxShadow:
                "0 30px 100px rgba(0,0,0,0.45)"
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap:
                  "15px"
              }}
            >

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
                      "9px",
                    fontWeight:
                      "900",
                    letterSpacing:
                      "1.5px",
                    marginBottom:
                      "7px"
                  }}
                >

                  <MessageSquare
                    size={12}
                  />

                  DOCTOR RESPONSE

                </div>


                <h2
                  style={{
                    margin:
                      0,
                    fontSize:
                      "20px",
                    fontWeight:
                      "800"
                  }}
                >
                  Respond to{" "}
                  {selectedEnquiry.patient_name}
                </h2>

              </div>


              <button
                type="button"
                onClick={
                  closeResponse
                }
                disabled={
                  sendingResponse
                }
                style={{
                  width:
                    "34px",
                  height:
                    "34px",
                  border:
                    `1px solid ${theme.border}`,
                  borderRadius:
                    "9px",
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
                    sendingResponse
                      ? "not-allowed"
                      : "pointer"
                }}
              >

                <X
                  size={16}
                />

              </button>

            </div>


            {/* PATIENT INFORMATION */}

            <div
              style={{
                display:
                  "flex",
                gap:
                  "9px",
                marginTop:
                  "19px",
                flexWrap:
                  "wrap"
              }}
            >

              <ModalInfo
                icon={UserRound}
                text={
                  selectedEnquiry.patient_name
                }
              />

              {selectedEnquiry.patient_age && (

                <ModalInfo
                  icon={Activity}
                  text={`Age ${selectedEnquiry.patient_age}`}
                />

              )}

              {selectedEnquiry.patient_gender && (

                <ModalInfo
                  icon={Stethoscope}
                  text={
                    selectedEnquiry.patient_gender
                  }
                />

              )}

            </div>


            {/* QUESTION */}

            <div
              style={{
                marginTop:
                  "16px",
                padding:
                  "15px",
                background:
                  "#071613",
                border:
                  `1px solid ${theme.border}`,
                borderRadius:
                  "13px"
              }}
            >

              <div
                style={{
                  color:
                    theme.muted,
                  fontSize:
                    "9px",
                  fontWeight:
                    "900",
                  letterSpacing:
                    "1px",
                  marginBottom:
                    "8px"
                }}
              >
                PATIENT QUESTION
              </div>


              <p
                style={{
                  margin:
                    0,
                  color:
                    theme.text,
                  fontSize:
                    "12px",
                  lineHeight:
                    1.7
                }}
              >
                {selectedEnquiry.question}
              </p>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                submitResponse
              }
              style={{
                marginTop:
                  "17px"
              }}
            >

              <label
                style={{
                  display:
                    "block",
                  marginBottom:
                    "7px",
                  color:
                    theme.text,
                  fontSize:
                    "11px",
                  fontWeight:
                    "800"
                }}
              >
                Your Response
              </label>


              <textarea
                value={
                  responseText
                }
                onChange={
                  event =>
                    setResponseText(
                      event.target.value
                    )
                }
                placeholder="Write your response to the patient..."
                rows={6}
                disabled={
                  sendingResponse
                }
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  resize:
                    "vertical",
                  border:
                    `1px solid ${theme.borderStrong}`,
                  borderRadius:
                    "12px",
                  padding:
                    "13px",
                  fontFamily:
                    "inherit",
                  fontSize:
                    "12px",
                  outline:
                    "none",
                  lineHeight:
                    1.6,
                  background:
                    "#071613",
                  color:
                    theme.text
                }}
              />


              {/* ERROR */}

              {enquiryError && (

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "7px",
                    marginTop:
                      "10px",
                    padding:
                      "11px 12px",
                    background:
                      "rgba(255,116,116,0.07)",
                    border:
                      "1px solid rgba(255,116,116,0.18)",
                    borderRadius:
                      "10px",
                    color:
                      theme.danger,
                    fontSize:
                      "10px"
                  }}
                >

                  <AlertCircle
                    size={14}
                  />

                  {enquiryError}

                </div>

              )}


              {/* SUCCESS */}

              {enquirySuccess && (

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "7px",
                    marginTop:
                      "10px",
                    padding:
                      "11px 12px",
                    background:
                      "rgba(66,214,167,0.07)",
                    border:
                      "1px solid rgba(66,214,167,0.18)",
                    borderRadius:
                      "10px",
                    color:
                      theme.success,
                    fontSize:
                      "10px"
                  }}
                >

                  <CheckCircle
                    size={14}
                  />

                  {enquirySuccess}

                </div>

              )}


              {/* BUTTONS */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "8px",
                  marginTop:
                    "15px"
                }}
              >

                <button
                  type="button"
                  onClick={
                    closeResponse
                  }
                  disabled={
                    sendingResponse
                  }
                  style={{
                    padding:
                      "10px 14px",
                    border:
                      `1px solid ${theme.border}`,
                    background:
                      "rgba(255,255,255,0.025)",
                    color:
                      theme.secondary,
                    borderRadius:
                      "9px",
                    cursor:
                      sendingResponse
                        ? "not-allowed"
                        : "pointer",
                    fontSize:
                      "10px",
                    fontWeight:
                      "700"
                  }}
                >
                  Close
                </button>


                <button
                  type="submit"
                  disabled={
                    sendingResponse ||
                    !responseText.trim()
                  }
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "7px",
                    padding:
                      "10px 15px",
                    border:
                      "none",
                    background:
                      sendingResponse ||
                      !responseText.trim()
                        ? "#17302C"
                        : theme.primary,
                    color:
                      sendingResponse ||
                      !responseText.trim()
                        ? theme.muted
                        : "#061412",
                    borderRadius:
                      "9px",
                    cursor:
                      sendingResponse ||
                      !responseText.trim()
                        ? "not-allowed"
                        : "pointer",
                    fontSize:
                      "10px",
                    fontWeight:
                      "800"
                  }}
                >

                  <Send
                    size={14}
                  />

                  {sendingResponse
                    ? "Sending..."
                    : "Send Response"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ===================================================== */}
      {/* RESPONSIVE CSS                                          */}
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


          @media (max-width: 800px) {

            .doctor-stat-grid {
              grid-template-columns:
                1fr !important;
            }

            .doctor-tools-grid {
              grid-template-columns:
                1fr !important;
            }

          }


          @media (max-width: 600px) {

            header {
              padding:
                0 15px !important;
            }

          }

        `}
      </style>

    </div>

  );

}


/* ========================================================= */
/* STAT CARD                                                   */
/* ========================================================= */

function StatCard({
  icon: Icon,
  value,
  label,
  accent
}) {

  return (

    <div
      style={{
        padding:
          "14px",
        border:
          `1px solid ${theme.border}`,
        borderRadius:
          "14px",
        background:
          theme.surface,
        display:
          "flex",
        alignItems:
          "center",
        gap:
          "11px"
      }}
    >

      <div
        style={{
          width:
            "33px",
          height:
            "33px",
          flexShrink:
            0,
          borderRadius:
            "10px",
          background:
            `${accent}12`,
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center"
        }}
      >

        <Icon
          size={16}
          color={accent}
        />

      </div>


      <div>

        <div
          style={{
            fontSize:
              "18px",
            fontWeight:
              "850",
            lineHeight:
              1
          }}
        >
          {value}
        </div>

        <div
          style={{
            marginTop:
              "4px",
            color:
              theme.muted,
            fontSize:
              "9px"
          }}
        >
          {label}
        </div>

      </div>

    </div>

  );

}


/* ========================================================= */
/* DASHBOARD TOOL                                              */
/* ========================================================= */

function DashboardTool({
  icon: Icon,
  title,
  description,
  accent,
  onClick
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      style={{
        position:
          "relative",
        overflow:
          "hidden",
        textAlign:
          "left",
        padding:
          "19px",
        minHeight:
          "145px",
        border:
          `1px solid ${theme.border}`,
        borderRadius:
          "16px",
        background:
          theme.surface,
        color:
          theme.text,
        cursor:
          "pointer",
        transition:
          "0.2s ease"
      }}
    >

      <div
        style={{
          width:
            "36px",
          height:
            "36px",
          borderRadius:
            "11px",
          background:
            `${accent}12`,
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center"
        }}
      >

        <Icon
          size={18}
          color={accent}
        />

      </div>


      <h3
        style={{
          margin:
            "14px 0 6px",
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
          margin:
            0,
          maxWidth:
            "270px",
          color:
            theme.muted,
          fontSize:
            "10px",
          lineHeight:
            1.65
        }}
      >
        {description}
      </p>


      <div
        style={{
          position:
            "absolute",
          right:
            "16px",
          bottom:
            "17px",
          color:
            theme.muted
        }}
      >

        <ArrowRight
          size={15}
        />

      </div>

    </button>

  );

}


/* ========================================================= */
/* ENQUIRY CARD                                                */
/* ========================================================= */

function EnquiryCard({
  enquiry,
  onRespond
}) {

  const answered =
    enquiry.status ===
    "Answered";


  return (

    <div
      style={{
        background:
          theme.surface,
        border:
          `1px solid ${theme.border}`,
        borderRadius:
          "16px",
        padding:
          "17px",
        boxShadow:
          "0 10px 35px rgba(0,0,0,0.10)"
      }}
    >

      {/* TOP */}

      <div
        style={{
          display:
            "flex",
          alignItems:
            "flex-start",
          justifyContent:
            "space-between",
          gap:
            "15px",
          flexWrap:
            "wrap"
        }}
      >

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
              width:
                "39px",
              height:
                "39px",
              flexShrink:
                0,
              borderRadius:
                "12px",
              background:
                "rgba(32,199,181,0.08)",
              border:
                "1px solid rgba(32,199,181,0.13)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center"
            }}
          >

            <UserRound
              size={18}
              color={
                theme.primary
              }
            />

          </div>


          <div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "7px",
                flexWrap:
                  "wrap"
              }}
            >

              <strong
                style={{
                  fontSize:
                    "13px",
                  fontWeight:
                    "800"
                }}
              >
                {enquiry.patient_name}
              </strong>


              {enquiry.patient_age && (

                <span
                  style={{
                    color:
                      theme.muted,
                    fontSize:
                      "9px"
                  }}
                >
                  Age {enquiry.patient_age}
                </span>

              )}


              {enquiry.patient_gender && (

                <span
                  style={{
                    color:
                      theme.muted,
                    fontSize:
                      "9px"
                  }}
                >
                  • {enquiry.patient_gender}
                </span>

              )}

            </div>


            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "5px",
                marginTop:
                  "4px",
                color:
                  theme.muted,
                fontSize:
                  "9px"
              }}
            >

              <Clock
                size={11}
              />

              {enquiry.created_at
                ? new Date(
                    enquiry.created_at
                  ).toLocaleString()
                : "Date unavailable"}

            </div>

          </div>

        </div>


        {/* STATUS */}

        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "5px",
            padding:
              "6px 9px",
            borderRadius:
              "20px",
            background:
              answered
                ? "rgba(66,214,167,0.08)"
                : "rgba(244,166,74,0.08)",
            border:
              answered
                ? "1px solid rgba(66,214,167,0.14)"
                : "1px solid rgba(244,166,74,0.14)",
            color:
              answered
                ? theme.success
                : theme.orange,
            fontSize:
              "9px",
            fontWeight:
              "800"
          }}
        >

          {answered ? (
            <CheckCircle
              size={12}
            />
          ) : (
            <Clock
              size={12}
            />
          )}

          {enquiry.status}

        </div>

      </div>


      {/* QUESTION */}

      <div
        style={{
          marginTop:
            "14px",
          padding:
            "13px",
          borderRadius:
            "11px",
          background:
            "#071613",
          border:
            `1px solid ${theme.border}`
        }}
      >

        <div
          style={{
            color:
              theme.muted,
            fontSize:
              "8px",
            fontWeight:
              "900",
            letterSpacing:
              "1px",
            marginBottom:
              "6px"
          }}
        >
          PATIENT QUESTION
        </div>


        <p
          style={{
            margin:
              0,
            color:
              theme.text,
            fontSize:
              "11px",
            lineHeight:
              1.7
          }}
        >
          {enquiry.question}
        </p>

      </div>


      {/* RESPONSE */}

      {answered &&
        enquiry.doctor_response && (

          <div
            style={{
              marginTop:
                "9px",
              padding:
                "13px",
              borderRadius:
                "11px",
              background:
                "rgba(66,214,167,0.045)",
              border:
                "1px solid rgba(66,214,167,0.13)"
            }}
          >

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "5px",
                color:
                  theme.success,
                fontSize:
                  "8px",
                fontWeight:
                  "900",
                letterSpacing:
                  "1px",
                marginBottom:
                  "6px"
              }}
            >

              <CheckCircle
                size={11}
              />

              YOUR RESPONSE

            </div>


            <p
              style={{
                margin:
                  0,
                color:
                  "#B9DCD5",
                fontSize:
                  "11px",
                lineHeight:
                  1.7
              }}
            >
              {enquiry.doctor_response}
            </p>

          </div>

        )}


      {/* RESPOND */}

      {!answered && (

        <button
          type="button"
          onClick={onRespond}
          style={{
            marginTop:
              "12px",
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "7px",
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
              "10px",
            fontWeight:
              "850"
          }}
        >

          <MessageSquare
            size={13}
          />

          Respond to Patient

          <ChevronRight
            size={13}
          />

        </button>

      )}

    </div>

  );

}


/* ========================================================= */
/* MODAL INFORMATION                                           */
/* ========================================================= */

function ModalInfo({
  icon: Icon,
  text
}) {

  return (

    <div
      style={{
        display:
          "flex",
        alignItems:
          "center",
        gap:
          "6px",
        padding:
          "7px 9px",
        borderRadius:
          "8px",
        background:
          "rgba(255,255,255,0.025)",
        border:
          `1px solid ${theme.border}`,
        color:
          theme.secondary,
        fontSize:
          "9px"
      }}
    >

      <Icon
        size={12}
        color={
          theme.primary
        }
      />

      {text}

    </div>

  );

}