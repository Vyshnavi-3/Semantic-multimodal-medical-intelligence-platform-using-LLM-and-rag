import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Mail,
  MessageSquare,
  UserRound,
  CalendarDays,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Activity,
  Circle
} from "lucide-react";

import Layout from "../components/Layout";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const DAY_SHORT = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN"
};

const COLORS = {
  bg: "#071413",
  panel: "#0B1B19",
  panelSoft: "#0F2421",
  panelElevated: "#102925",
  border: "#193733",
  borderStrong: "#24514A",
  primary: "#20C7B5",
  primaryDark: "#0D8F82",
  primarySoft: "rgba(32, 199, 181, 0.10)",
  primaryGlow: "rgba(32, 199, 181, 0.18)",
  text: "#ECF8F6",
  muted: "#91AAA6",
  mutedDark: "#647D79",
  white: "#FFFFFF",
  warning: "#F4A64A",
  warningSoft: "rgba(244, 166, 74, 0.10)",
  danger: "#FF7474",
  dangerSoft: "rgba(255, 116, 116, 0.10)",
  success: "#42D6A7",
  successSoft: "rgba(66, 214, 167, 0.10)"
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);

  const [enquirySuccess, setEnquirySuccess] = useState("");
  const [enquiryError, setEnquiryError] = useState("");

  const [patientEnquiries, setPatientEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [enquiryListError, setEnquiryListError] = useState("");

  useEffect(() => {
    fetchDoctors();
    fetchPatientEnquiries();
  }, []);

  async function fetchDoctors() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/doctors/available"
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load doctor availability."
        );
      }

      const data = await response.json();

      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Doctor loading error:",
        error
      );

      setError(
        "Unable to load doctor availability. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchPatientEnquiries() {
    try {
      setLoadingEnquiries(true);
      setEnquiryListError("");

      const savedUser =
        localStorage.getItem("mediora_user");

      if (!savedUser) {
        setEnquiryListError(
          "Your login session could not be found."
        );
        return;
      }

      let loggedInUser;

      try {
        const parsedData = JSON.parse(savedUser);

        loggedInUser =
          parsedData?.user || parsedData;
      } catch (error) {
        console.error(
          "User data error:",
          error
        );

        setEnquiryListError(
          "Your login session is invalid. Please sign in again."
        );

        return;
      }

      const patientId =
        loggedInUser?.patient_id;

      if (!patientId) {
        setEnquiryListError(
          "No patient profile is linked to this account."
        );
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/doctors/enquiries/patient/${patientId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to load your enquiries."
        );
      }

      setPatientEnquiries(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Patient enquiries loading error:",
        error
      );

      setEnquiryListError(
        error.message ||
          "Unable to load your enquiries."
      );
    } finally {
      setLoadingEnquiries(false);
    }
  }

  function groupDoctors() {
    const grouped = {};

    doctors.forEach((availability) => {
      const doctorId =
        availability.doctor_id;

      if (!grouped[doctorId]) {
        grouped[doctorId] = {
        doctor_id: doctorId,
        doctor_name:
          availability.doctor_name,
        doctor_email:
          availability.doctor_email,
        specialization:
          availability.specialization || "General Medicine",
        availability: []
      };
      }

      grouped[doctorId].availability.push(
        availability
      );
    });

    return Object.values(grouped);
  }

  function getDayAvailability(
    doctorAvailability,
    day
  ) {
    return doctorAvailability.filter(
      (item) =>
        item.day_of_week === day &&
        item.status === "Available"
    );
  }

  function openEnquiry(
    doctor,
    slot
  ) {
    setSelectedDoctor(doctor);
    setSelectedSlot(slot);
    setQuestion("");
    setEnquirySuccess("");
    setEnquiryError("");
  }

  function closeEnquiry() {
    if (sending) {
      return;
    }

    setSelectedDoctor(null);
    setSelectedSlot(null);
    setQuestion("");
    setEnquirySuccess("");
    setEnquiryError("");
  }

  async function submitEnquiry(event) {
    event.preventDefault();

    if (!question.trim()) {
      setEnquiryError(
        "Please enter your condition or question."
      );
      return;
    }

    const savedUser =
      localStorage.getItem("mediora_user");

    if (!savedUser) {
      setEnquiryError(
        "Your login session could not be found. Please sign in again."
      );
      return;
    }

    let loggedInUser;

    try {
      const parsedData =
        JSON.parse(savedUser);

      loggedInUser =
        parsedData?.user ||
        parsedData;
    } catch (error) {
      console.error(
        "User data error:",
        error
      );

      setEnquiryError(
        "Your login session is invalid. Please sign in again."
      );

      return;
    }

    const patientId =
      loggedInUser?.patient_id;

    if (!patientId) {
      setEnquiryError(
        "No patient profile is linked to this account."
      );
      return;
    }

    if (!selectedDoctor) {
      setEnquiryError(
        "Please select a doctor."
      );
      return;
    }

    try {
      setSending(true);
      setEnquiryError("");
      setEnquirySuccess("");

      const response = await fetch(
        "http://127.0.0.1:8000/doctors/enquiries",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            patient_id:
              Number(patientId),
            doctor_id:
              selectedDoctor.doctor_id,
            question:
              question.trim()
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to send enquiry."
        );
      }

      setEnquirySuccess(
        "Your enquiry was sent successfully to the doctor."
      );

      setQuestion("");

      /*
       * Refresh enquiry history so the
       * newly submitted question appears
       * immediately after closing the modal.
       */
      await fetchPatientEnquiries();
    } catch (error) {
      console.error(
        "Enquiry submission error:",
        error
      );

      setEnquiryError(
        error.message ||
          "Unable to send enquiry. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  const groupedDoctors =
    useMemo(
      () => groupDoctors(),
      [doctors]
    );

  const totalAvailableSlots =
    doctors.length;

  return (
    <Layout
      title="Doctor Connect"
      subtitle="Connect with doctors during their available consultation windows."
    >
      <div
        style={{
          minHeight: "100%",
          color: COLORS.text,
          fontFamily:
            '"Manrope", "DM Sans", system-ui, sans-serif',
          paddingBottom: "40px"
        }}
      >

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #0C211E 0%, #0A1918 55%, #102925 100%)",
            border:
              `1px solid ${COLORS.border}`,
            borderRadius: "24px",
            padding: "30px",
            marginBottom: "24px",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.22)"
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background:
                "rgba(32,199,181,0.08)",
              right: "-70px",
              top: "-100px",
              filter: "blur(5px)"
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "18px"
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  flexShrink: 0,
                  borderRadius: "17px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(145deg, #20C7B5, #0D8F82)",
                  boxShadow:
                    "0 10px 30px rgba(32,199,181,0.22)"
                }}
              >
                <CalendarDays
                  size={27}
                  color="#061412"
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    letterSpacing: "2px",
                    color:
                      COLORS.primary,
                    marginBottom: "8px"
                  }}
                >
                  MEDIORA • DOCTOR CONNECT
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
                  Consultation Timeline
                </h1>

                <p
                  style={{
                    margin:
                      "10px 0 0",
                    maxWidth: "600px",
                    color:
                      COLORS.muted,
                    fontSize: "14px",
                    lineHeight: 1.7
                  }}
                >
                  Find a doctor's available
                  consultation window and send
                  your medical query securely.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px"
              }}
            >
              <div
                style={{
                  padding:
                    "12px 16px",
                  border:
                    `1px solid ${COLORS.borderStrong}`,
                  background:
                    "rgba(32,199,181,0.07)",
                  borderRadius: "14px",
                  minWidth: "110px"
                }}
              >
                <div
                  style={{
                    color:
                      COLORS.primary,
                    fontSize: "22px",
                    fontWeight: "800"
                  }}
                >
                  {groupedDoctors.length}
                </div>

                <div
                  style={{
                    color:
                      COLORS.muted,
                    fontSize: "11px",
                    marginTop: "2px"
                  }}
                >
                  Doctors
                </div>
              </div>

              <div
                style={{
                  padding:
                    "12px 16px",
                  border:
                    `1px solid ${COLORS.borderStrong}`,
                  background:
                    "rgba(32,199,181,0.07)",
                  borderRadius: "14px",
                  minWidth: "110px"
                }}
              >
                <div
                  style={{
                    color:
                      COLORS.primary,
                    fontSize: "22px",
                    fontWeight: "800"
                  }}
                >
                  {totalAvailableSlots}
                </div>

                <div
                  style={{
                    color:
                      COLORS.muted,
                    fontSize: "11px",
                    marginTop: "2px"
                  }}
                >
                  Time windows
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* SECURITY STRIP */}
        {/* ================================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            padding: "13px 16px",
            marginBottom: "28px",
            border:
              `1px solid ${COLORS.border}`,
            background:
              "rgba(32,199,181,0.035)",
            borderRadius: "14px",
            color: COLORS.muted,
            fontSize: "12px"
          }}
        >
          <ShieldCheck
            size={18}
            color={COLORS.primary}
          />

          <span>
            Your enquiry is connected to your
            patient profile and routed directly
            to the selected doctor.
          </span>
        </div>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              border:
                `1px solid ${COLORS.border}`,
              background:
                COLORS.panel,
              borderRadius: "20px"
            }}
          >
            <Activity
              size={30}
              color={COLORS.primary}
              style={{
                animation:
                  "spin 1.5s linear infinite"
              }}
            />

            <p
              style={{
                margin:
                  "14px 0 0",
                color: COLORS.muted
              }}
            >
              Loading consultation schedules...
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && !loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px",
              border:
                `1px solid rgba(255,116,116,0.25)`,
              background:
                COLORS.dangerSoft,
              color: COLORS.danger,
              borderRadius: "14px",
              marginBottom: "24px"
            }}
          >
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* NO DOCTORS */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          groupedDoctors.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "70px 20px",
                border:
                  `1px solid ${COLORS.border}`,
                background:
                  COLORS.panel,
                borderRadius: "20px"
              }}
            >
              <div
                style={{
                  width: "66px",
                  height: "66px",
                  margin: "0 auto 18px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    COLORS.primarySoft
                }}
              >
                <UserRound
                  size={30}
                  color={COLORS.primary}
                />
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "20px"
                }}
              >
                No consultation windows
              </h3>

              <p
                style={{
                  color: COLORS.muted,
                  margin:
                    "8px 0 0",
                  fontSize: "14px"
                }}
              >
                Doctors have not published
                any available consultation
                times yet.
              </p>
            </div>
          )}

        {/* ================================================= */}
        {/* DOCTOR TIMELINES */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          groupedDoctors.length > 0 && (
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "15px",
                  marginBottom: "15px",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <div
                    style={{
                      color:
                        COLORS.primary,
                      fontSize: "11px",
                      fontWeight: "800",
                      letterSpacing:
                        "1.8px"
                    }}
                  >
                    LIVE SCHEDULE
                  </div>

                  <h2
                    style={{
                      margin:
                        "5px 0 0",
                      fontSize: "22px"
                    }}
                  >
                    Doctor availability
                  </h2>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    color:
                      COLORS.muted,
                    fontSize: "12px"
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background:
                        COLORS.success,
                      boxShadow:
                        "0 0 10px rgba(66,214,167,0.7)"
                    }}
                  />
                  Available for enquiries
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "20px"
                }}
              >
                {groupedDoctors.map(
                  (doctor) => (
                    <DoctorTimeline
                      key={
                        doctor.doctor_id
                      }
                      doctor={doctor}
                      getDayAvailability={
                        getDayAvailability
                      }
                      openEnquiry={
                        openEnquiry
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

        {/* ================================================= */}
        {/* ENQUIRIES */}
        {/* ================================================= */}

        <section
          style={{
            marginTop: "42px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "flex-end",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "16px"
            }}
          >
            <div>
              <div
                style={{
                  color:
                    COLORS.primary,
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing:
                    "1.8px"
                }}
              >
                PATIENT COMMUNICATION
              </div>

              <h2
                style={{
                  margin:
                    "5px 0 0",
                  fontSize: "22px"
                }}
              >
                Your conversations
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: COLORS.muted,
                  fontSize: "13px"
                }}
              >
                Questions, doctor responses
                and enquiry status.
              </p>
            </div>

            <button
              type="button"
              onClick={
                fetchPatientEnquiries
              }
              disabled={
                loadingEnquiries
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border:
                  `1px solid ${COLORS.borderStrong}`,
                background:
                  COLORS.panel,
                color: COLORS.text,
                borderRadius: "11px",
                padding:
                  "10px 14px",
                cursor:
                  loadingEnquiries
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "700",
                fontSize: "12px"
              }}
            >
              <RefreshCw
                size={15}
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

          {/* Enquiry list error */}
          {enquiryListError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "14px",
                marginBottom: "16px",
                background:
                  COLORS.dangerSoft,
                border:
                  "1px solid rgba(255,116,116,0.22)",
                borderRadius: "13px",
                color: COLORS.danger,
                fontSize: "13px"
              }}
            >
              <AlertCircle size={17} />
              {enquiryListError}
            </div>
          )}

          {/* Loading */}
          {loadingEnquiries &&
            !enquiryListError && (
              <div
                style={{
                  padding: "45px",
                  textAlign: "center",
                  background:
                    COLORS.panel,
                  border:
                    `1px solid ${COLORS.border}`,
                  borderRadius: "18px"
                }}
              >
                <p
                  style={{
                    color: COLORS.muted,
                    margin: 0,
                    fontSize: "13px"
                  }}
                >
                  Loading your conversations...
                </p>
              </div>
            )}

          {/* Empty */}
          {!loadingEnquiries &&
            !enquiryListError &&
            patientEnquiries.length ===
              0 && (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  background:
                    COLORS.panel,
                  border:
                    `1px solid ${COLORS.border}`,
                  borderRadius: "18px"
                }}
              >
                <MessageSquare
                  size={30}
                  color={COLORS.mutedDark}
                />

                <h3
                  style={{
                    margin:
                      "14px 0 5px",
                    fontSize: "17px"
                  }}
                >
                  No conversations yet
                </h3>

                <p
                  style={{
                    color: COLORS.muted,
                    margin: 0,
                    fontSize: "13px"
                  }}
                >
                  Select an available doctor
                  above to send your first
                  enquiry.
                </p>
              </div>
            )}

          {/* Enquiries */}
          {!loadingEnquiries &&
            patientEnquiries.length >
              0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "12px"
                }}
              >
                {patientEnquiries.map(
                  (enquiry) => (
                    <EnquiryCard
                      key={enquiry.id}
                      enquiry={enquiry}
                    />
                  )
                )}
              </div>
            )}
        </section>

        {/* ================================================= */}
        {/* MODAL */}
        {/* ================================================= */}

        {selectedDoctor && (
          <EnquiryModal
            selectedDoctor={
              selectedDoctor
            }
            selectedSlot={
              selectedSlot
            }
            question={question}
            setQuestion={setQuestion}
            sending={sending}
            enquirySuccess={
              enquirySuccess
            }
            enquiryError={
              enquiryError
            }
            submitEnquiry={
              submitEnquiry
            }
            closeEnquiry={
              closeEnquiry
            }
          />
        )}
      </div>

      {/* Local animations */}
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

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.55;
              transform: scale(0.85);
            }
          }

          @media (max-width: 760px) {
            .doctor-day-grid {
              grid-template-columns: repeat(4, minmax(115px, 1fr)) !important;
            }
          }
        `}
      </style>
    </Layout>
  );
}


/* ========================================================= */
/* DOCTOR TIMELINE                                            */
/* ========================================================= */

function DoctorTimeline({
  doctor,
  getDayAvailability,
  openEnquiry
}) {
  const availableCount =
    doctor.availability.filter(
      (item) =>
        item.status === "Available"
    ).length;

  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, #0D211F, #091917)",
        border:
          `1px solid ${COLORS.border}`,
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow:
          "0 15px 45px rgba(0,0,0,0.16)"
      }}
    >
      {/* Doctor identity */}
      <div
        style={{
          padding: "22px 24px",
          borderBottom:
            `1px solid ${COLORS.border}`,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              flexShrink: 0,
              borderRadius: "16px",
              background:
                "linear-gradient(145deg, #153C37, #0E2925)",
              border:
                `1px solid ${COLORS.borderStrong}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <UserRound
              size={25}
              color={COLORS.primary}
            />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                flexWrap: "wrap"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: "800"
                }}
              >
                {doctor.doctor_name}
              </h3>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding:
                    "4px 8px",
                  borderRadius: "20px",
                  background:
                    COLORS.successSoft,
                  color:
                    COLORS.success,
                  fontSize: "9px",
                  fontWeight: "800",
                  letterSpacing:
                    "0.8px"
                }}
              >
                <Circle
                  size={6}
                  fill="currentColor"
                />
                AVAILABLE
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "6px",
                color: COLORS.muted,
                fontSize: "12px"
              }}
            >
              <Mail size={13} />
              {doctor.doctor_email}
            </div>
          </div>
        </div>
        {doctor.specialization && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "6px",
            color: COLORS.primary,
            fontSize: "12px",
            fontWeight: "700"
          }}
        >
          <Activity size={13} />
          {doctor.specialization}
        </div>
      )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: COLORS.muted,
            fontSize: "11px"
          }}
        >
          <Clock3
            size={15}
            color={COLORS.primary}
          />

          {availableCount} consultation
          {availableCount !== 1
            ? " windows"
            : " window"}
        </div>
      </div>

      {/* Timeline */}
      <div
        style={{
          padding: "20px 24px 24px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "13px"
          }}
        >
          <Activity
            size={15}
            color={COLORS.primary}
          />

          <span
            style={{
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1.5px",
              color: COLORS.muted
            }}
          >
            WEEKLY CONSULTATION TIMELINE
          </span>
        </div>

        <div
          style={{
            overflowX: "auto",
            paddingBottom: "3px"
          }}
        >
          <div
            className="doctor-day-grid"
            style={{
              minWidth: "820px",
              display: "grid",
              gridTemplateColumns:
                "repeat(7, minmax(105px, 1fr))",
              gap: "8px"
            }}
          >
            {DAYS.map((day) => {
              const slots =
                getDayAvailability(
                  doctor.availability,
                  day
                );

              return (
                <div
                  key={day}
                  style={{
                    minHeight: "190px",
                    border:
                      `1px solid ${COLORS.border}`,
                    borderRadius: "15px",
                    background:
                      "rgba(255,255,255,0.012)",
                    overflow: "hidden"
                  }}
                >
                  {/* Day */}
                  <div
                    style={{
                      padding:
                        "10px 9px",
                      borderBottom:
                        `1px solid ${COLORS.border}`,
                      background:
                        "rgba(255,255,255,0.015)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        color:
                          COLORS.muted
                      }}
                    >
                      {DAY_SHORT[day]}
                    </div>

                    <div
                      style={{
                        fontSize: "8px",
                        marginTop: "2px",
                        color:
                          COLORS.mutedDark
                      }}
                    >
                      {day}
                    </div>
                  </div>

                  {/* Slots */}
                  <div
                    style={{
                      padding: "10px",
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: "8px"
                    }}
                  >
                    {slots.length === 0 ? (
                      <div
                        style={{
                          minHeight:
                            "125px",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          flexDirection:
                            "column",
                          gap: "7px",
                          color:
                            COLORS.mutedDark
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius:
                              "50%",
                            background:
                              COLORS.borderStrong
                          }}
                        />

                        <span
                          style={{
                            fontSize: "10px"
                          }}
                        >
                          No slot
                        </span>
                      </div>
                    ) : (
                      slots.map(
                        (slot) => (
                          <div
                            key={
                              slot.availability_id
                            }
                            style={{
                              position:
                                "relative",
                              padding:
                                "12px 9px",
                              borderRadius:
                                "12px",
                              background:
                                "linear-gradient(145deg, rgba(32,199,181,0.13), rgba(32,199,181,0.045))",
                              border:
                                "1px solid rgba(32,199,181,0.28)"
                            }}
                          >
                            {/* Timeline line */}
                            <div
                              style={{
                                position:
                                  "absolute",
                                left: "-1px",
                                top: "13px",
                                bottom: "13px",
                                width: "2px",
                                background:
                                  COLORS.primary,
                                borderRadius:
                                  "5px"
                              }}
                            />

                            <div
                              style={{
                                paddingLeft:
                                  "4px"
                              }}
                            >
                              <div
                                style={{
                                  color:
                                    COLORS.text,
                                  fontWeight:
                                    "800",
                                  fontSize:
                                    "12px"
                                }}
                              >
                                {slot.start_time}
                              </div>

                              <div
                                style={{
                                  color:
                                    COLORS.mutedDark,
                                  fontSize:
                                    "9px",
                                  margin:
                                    "3px 0"
                                }}
                              >
                                until
                              </div>

                              <div
                                style={{
                                  color:
                                    COLORS.primary,
                                  fontWeight:
                                    "800",
                                  fontSize:
                                    "12px"
                                }}
                              >
                                {slot.end_time}
                              </div>

                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "5px",
                                  marginTop:
                                    "8px",
                                  color:
                                    COLORS.success,
                                  fontSize:
                                    "8px",
                                  fontWeight:
                                    "800",
                                  letterSpacing:
                                    "0.6px"
                                }}
                              >
                                <Circle
                                  size={5}
                                  fill="currentColor"
                                />
                                OPEN
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openEnquiry(
                                    doctor,
                                    slot
                                  )
                                }
                                style={{
                                  width: "100%",
                                  marginTop:
                                    "9px",
                                  padding:
                                    "8px 5px",
                                  border:
                                    "none",
                                  borderRadius:
                                    "8px",
                                  background:
                                    COLORS.primary,
                                  color:
                                    "#061412",
                                  fontSize:
                                    "9px",
                                  fontWeight:
                                    "800",
                                  cursor:
                                    "pointer",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  gap: "4px",
                                  transition:
                                    "0.2s ease"
                                }}
                              >
                                <MessageSquare
                                  size={11}
                                />

                                ASK DOCTOR
                              </button>
                            </div>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            marginTop: "14px",
            color: COLORS.mutedDark,
            fontSize: "10px"
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background:
                COLORS.primary,
              boxShadow:
                "0 0 8px rgba(32,199,181,0.5)"
            }}
          />

          Click an open window to send
          your question to this doctor.
        </div>
      </div>
    </div>
  );
}


/* ========================================================= */
/* ENQUIRY CARD                                               */
/* ========================================================= */

function EnquiryCard({
  enquiry
}) {
  const answered =
    enquiry.status === "Answered";

  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, #0D211F, #0A1918)",
        border:
          `1px solid ${COLORS.border}`,
        borderRadius: "18px",
        padding: "20px",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.12)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          gap: "15px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px"
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "11px",
                background:
                  COLORS.primarySoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <UserRound
                size={17}
                color={COLORS.primary}
              />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: "800"
                }}
              >
                {enquiry.doctor_name}
              </h3>

              {enquiry.doctor_email && (
                <div
                  style={{
                    marginTop: "3px",
                    color:
                      COLORS.mutedDark,
                    fontSize: "10px"
                  }}
                >
                  {enquiry.doctor_email}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding:
              "7px 10px",
            borderRadius: "20px",
            background: answered
              ? COLORS.successSoft
              : COLORS.warningSoft,
            color: answered
              ? COLORS.success
              : COLORS.warning,
            fontSize: "9px",
            fontWeight: "800",
            letterSpacing:
              "0.7px"
          }}
        >
          {answered ? (
            <CheckCircle2 size={13} />
          ) : (
            <Clock3 size={13} />
          )}

          {answered
            ? "ANSWERED"
            : "PENDING"}
        </div>
      </div>

      {/* Question */}
      <div
        style={{
          marginTop: "17px",
          padding: "15px",
          borderRadius: "13px",
          background:
            "rgba(255,255,255,0.025)",
          border:
            `1px solid ${COLORS.border}`
        }}
      >
        <div
          style={{
            fontSize: "9px",
            fontWeight: "800",
            letterSpacing:
              "1.2px",
            color:
              COLORS.mutedDark,
            marginBottom: "7px"
          }}
        >
          YOUR QUESTION
        </div>

        <div
          style={{
            color: COLORS.text,
            fontSize: "13px",
            lineHeight: 1.7
          }}
        >
          {enquiry.question}
        </div>
      </div>

      {/* Response */}
      {answered &&
        enquiry.doctor_response && (
          <div
            style={{
              marginTop: "10px",
              padding: "15px",
              borderRadius: "13px",
              background:
                COLORS.successSoft,
              border:
                "1px solid rgba(66,214,167,0.18)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "9px",
                fontWeight: "800",
                letterSpacing:
                  "1.2px",
                color:
                  COLORS.success,
                marginBottom: "7px"
              }}
            >
              <CheckCircle2 size={13} />
              DOCTOR'S RESPONSE
            </div>

            <div
              style={{
                color: "#D8F5EA",
                fontSize: "13px",
                lineHeight: 1.7
              }}
            >
              {enquiry.doctor_response}
            </div>

            {enquiry.responded_at && (
              <div
                style={{
                  marginTop: "9px",
                  color:
                    COLORS.mutedDark,
                  fontSize: "10px"
                }}
              >
                Responded:{" "}
                {new Date(
                  enquiry.responded_at
                ).toLocaleString()}
              </div>
            )}
          </div>
        )}

      {!answered && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            marginTop: "12px",
            color: COLORS.warning,
            fontSize: "11px"
          }}
        >
          <Clock3 size={14} />

          Waiting for the doctor's
          response.
        </div>
      )}

      {enquiry.created_at && (
        <div
          style={{
            marginTop: "12px",
            color:
              COLORS.mutedDark,
            fontSize: "9px"
          }}
        >
          Sent:{" "}
          {new Date(
            enquiry.created_at
          ).toLocaleString()}
        </div>
      )}
    </div>
  );
}


/* ========================================================= */
/* ENQUIRY MODAL                                              */
/* ========================================================= */

function EnquiryModal({
  selectedDoctor,
  selectedSlot,
  question,
  setQuestion,
  sending,
  enquirySuccess,
  enquiryError,
  submitEnquiry,
  closeEnquiry
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background:
          "rgba(2, 10, 9, 0.78)",
        backdropFilter:
          "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
      onClick={closeEnquiry}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "590px",
          maxHeight:
            "calc(100vh - 40px)",
          overflowY: "auto",
          background:
            "linear-gradient(145deg, #102724, #091816)",
          border:
            `1px solid ${COLORS.borderStrong}`,
          borderRadius: "24px",
          boxShadow:
            "0 30px 90px rgba(0,0,0,0.5)"
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom:
              `1px solid ${COLORS.border}`,
            display: "flex",
            justifyContent:
              "space-between",
            gap: "15px"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "13px"
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                background:
                  COLORS.primarySoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <MessageSquare
                size={21}
                color={COLORS.primary}
              />
            </div>

            <div>
              <div
                style={{
                  color:
                    COLORS.primary,
                  fontSize: "9px",
                  fontWeight: "800",
                  letterSpacing:
                    "1.5px"
                }}
              >
                DOCTOR ENQUIRY
              </div>

              <h2
                style={{
                  margin:
                    "5px 0 0",
                  fontSize: "21px"
                }}
              >
                Ask{" "}
                {selectedDoctor.doctor_name}
              </h2>

              {selectedSlot && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "7px",
                    color:
                      COLORS.success,
                    fontSize: "11px",
                    fontWeight: "700"
                  }}
                >
                  <Clock3 size={13} />

                  {selectedSlot.day_of_week}
                  {" • "}
                  {selectedSlot.start_time}
                  {" – "}
                  {selectedSlot.end_time}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={closeEnquiry}
            disabled={sending}
            style={{
              width: "36px",
              height: "36px",
              flexShrink: 0,
              border:
                `1px solid ${COLORS.border}`,
              background:
                "rgba(255,255,255,0.03)",
              color: COLORS.muted,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: sending
                ? "not-allowed"
                : "pointer"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px"
          }}
        >
          <p
            style={{
              margin:
                "0 0 18px",
              color: COLORS.muted,
              fontSize: "13px",
              lineHeight: 1.6
            }}
          >
            Describe your condition,
            concern, or question. Your
            enquiry will be sent to the
            selected doctor.
          </p>

          {/* Success */}
          {enquirySuccess && (
            <div
              style={{
                padding: "16px",
                borderRadius: "13px",
                background:
                  COLORS.successSoft,
                border:
                  "1px solid rgba(66,214,167,0.2)",
                color:
                  COLORS.success,
                display: "flex",
                gap: "9px",
                fontSize: "12px",
                lineHeight: 1.5,
                marginBottom: "18px"
              }}
            >
              <CheckCircle2
                size={18}
                style={{
                  flexShrink: 0
                }}
              />

              <span>
                {enquirySuccess}
              </span>
            </div>
          )}

          {/* Error */}
          {enquiryError && (
            <div
              style={{
                padding: "14px",
                borderRadius: "13px",
                background:
                  COLORS.dangerSoft,
                border:
                  "1px solid rgba(255,116,116,0.2)",
                color:
                  COLORS.danger,
                display: "flex",
                gap: "9px",
                fontSize: "12px",
                lineHeight: 1.5,
                marginBottom: "18px"
              }}
            >
              <AlertCircle
                size={17}
                style={{
                  flexShrink: 0
                }}
              />

              <span>
                {enquiryError}
              </span>
            </div>
          )}

          {!enquirySuccess && (
            <form
              onSubmit={submitEnquiry}
            >
              <label
                htmlFor="doctor-question"
                style={{
                  display: "block",
                  color: COLORS.text,
                  fontSize: "12px",
                  fontWeight: "800",
                  marginBottom: "9px"
                }}
              >
                YOUR QUESTION
              </label>

              <textarea
                id="doctor-question"
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                placeholder="Example: I have a question about one of my medical reports..."
                rows={7}
                maxLength={1000}
                disabled={sending}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                  minHeight: "150px",
                  border:
                    `1px solid ${COLORS.borderStrong}`,
                  borderRadius: "14px",
                  padding: "14px",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                  background:
                    "#071613",
                  color: COLORS.text,
                  outline: "none"
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginTop: "7px",
                  color:
                    COLORS.mutedDark,
                  fontSize: "10px"
                }}
              >
                <span>
                  Keep your question clear
                  and specific.
                </span>

                <span>
                  {question.length}/1000
                </span>
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{
                  width: "100%",
                  marginTop: "18px",
                  padding: "13px",
                  border: "none",
                  borderRadius: "12px",
                  background:
                    sending
                      ? COLORS.primaryDark
                      : COLORS.primary,
                  color: "#061412",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: sending
                    ? "not-allowed"
                    : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  gap: "8px"
                }}
              >
                <Send size={16} />

                {sending
                  ? "Sending enquiry..."
                  : "Send Enquiry"}
              </button>
            </form>
          )}

          {enquirySuccess && (
            <button
              type="button"
              onClick={closeEnquiry}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "12px",
                background:
                  COLORS.primary,
                color: "#061412",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}