import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  UserRound,
  ArrowRight,
  Plus,
  X,
  Users,
  ShieldCheck,
  Circle,
  CalendarDays,
  Activity,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Stethoscope
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

export default function PatientSelection() {

  const navigate = useNavigate();


  /* ========================================================= */
  /* PATIENTS                                                    */
  /* ========================================================= */

  const [patients, setPatients] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* ========================================================= */
  /* NEW PATIENT                                                 */
  /* ========================================================= */

  const [showForm, setShowForm] =
    useState(false);

  const [newPatient, setNewPatient] =
    useState({
      name: "",
      age: "",
      gender: ""
    });

  const [creatingPatient, setCreatingPatient] =
    useState(false);

  const [formError, setFormError] =
    useState("");


  /* ========================================================= */
  /* FETCH PATIENTS                                              */
  /* ========================================================= */

  useEffect(() => {

    async function fetchPatients() {

      try {

        setLoading(true);

        setError("");


        const response =
          await fetch(
            "http://127.0.0.1:8000/patients/"
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Failed to load patients"
          );

        }


        setPatients(
          Array.isArray(data)
            ? data
            : []
        );


      } catch (error) {

        console.error(
          "Patient fetch error:",
          error
        );


        setError(
          "Unable to load patients. Please make sure the backend is running."
        );


      } finally {

        setLoading(false);

      }

    }


    fetchPatients();

  }, []);


  /* ========================================================= */
  /* SEARCH                                                     */
  /* ========================================================= */

  const filteredPatients =
    useMemo(() => {

      const searchValue =
        search.trim().toLowerCase();


      if (!searchValue) {
        return patients;
      }


      return patients.filter(
        patient =>
          (patient.name || "")
            .toLowerCase()
            .includes(searchValue)
      );

    }, [patients, search]);


  /* ========================================================= */
  /* INITIALS                                                   */
  /* ========================================================= */

  function getInitials(name) {

    if (!name) {
      return "P";
    }


    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map(word => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  }


  /* ========================================================= */
  /* SELECT PATIENT                                             */
  /* ========================================================= */

  function selectPatient(patient) {

    const selectedPatient = {

      id:
        patient.id,

      name:
        patient.name,

      age:
        patient.age,

      gender:
        patient.gender,

      initials:
        getInitials(
          patient.name
        )

    };


    localStorage.setItem(
      "selectedPatient",
      JSON.stringify(
        selectedPatient
      )
    );


    navigate("/dashboard");

  }


  /* ========================================================= */
  /* OPEN NEW PATIENT                                           */
  /* ========================================================= */

  function handleNewPatient() {

    setNewPatient({
      name: "",
      age: "",
      gender: ""
    });

    setFormError("");

    setShowForm(true);

  }


  /* ========================================================= */
  /* CLOSE FORM                                                 */
  /* ========================================================= */

  function closePatientForm() {

    if (creatingPatient) {
      return;
    }

    setShowForm(false);

    setFormError("");

  }


  /* ========================================================= */
  /* FORM INPUT                                                 */
  /* ========================================================= */

  function handlePatientInput(event) {

    const {
      name,
      value
    } = event.target;


    setNewPatient(
      previous => ({
        ...previous,
        [name]: value
      })
    );

  }


  /* ========================================================= */
  /* CREATE PATIENT                                             */
  /* ========================================================= */

  async function createPatient(event) {

    event.preventDefault();

    setFormError("");


    const patientName =
      newPatient.name.trim();


    if (!patientName) {

      setFormError(
        "Patient name is required."
      );

      return;

    }


    if (
      newPatient.age !== "" &&
      Number(newPatient.age) < 0
    ) {

      setFormError(
        "Age cannot be negative."
      );

      return;

    }


    try {

      setCreatingPatient(true);


      const response =
        await fetch(
          "http://127.0.0.1:8000/patients/",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              name:
                patientName,

              age:
                newPatient.age === ""
                  ? null
                  : Number(
                      newPatient.age
                    ),

              gender:
                newPatient.gender ||
                null

            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        if (
          Array.isArray(
            data.detail
          )
        ) {

          throw new Error(
            data.detail
              .map(
                item => item.msg
              )
              .join(", ")
          );

        }


        throw new Error(
          data.detail ||
          "Failed to create patient."
        );

      }


      const createdPatient = {

        id:
          data.id,

        name:
          data.name,

        age:
          data.age,

        gender:
          data.gender,

        created_at:
          new Date().toISOString()

      };


      setPatients(
        previous => [
          ...previous,
          createdPatient
        ]
      );


      setShowForm(false);


      setNewPatient({
        name: "",
        age: "",
        gender: ""
      });


    } catch (error) {

      console.error(
        "Create patient error:",
        error
      );


      setFormError(
        error.message ||
        "Unable to create patient."
      );


    } finally {

      setCreatingPatient(false);

    }

  }


  /* ========================================================= */
  /* RENDER                                                      */
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
          display:
            "flex",
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
          zIndex: 50
        }}
      >

        {/* BRAND */}

        <div
          style={{
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
                "39px",
              height:
                "39px",
              borderRadius:
                "12px",
              background:
                "linear-gradient(145deg, #20C7B5, #0D8F82)",
              display:
                "flex",
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
                  "800"
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


        {/* PORTAL STATUS */}

        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "7px",
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

          DOCTOR PORTAL

        </div>

      </header>


      {/* ===================================================== */}
      {/* MAIN                                                      */}
      {/* ===================================================== */}

      <main
        style={{
          width:
            "100%",
          maxWidth:
            "1180px",
          margin:
            "0 auto",
          padding:
            "35px 24px 45px",
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
              "linear-gradient(135deg, #0C211E 0%, #081614 60%, #102925 100%)",
            border:
              `1px solid ${theme.border}`,
            borderRadius:
              "23px",
            padding:
              "27px",
            marginBottom:
              "18px",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.20)"
          }}
        >

          <div
            style={{
              position:
                "absolute",
              width:
                "250px",
              height:
                "250px",
              borderRadius:
                "50%",
              background:
                "rgba(32,199,181,0.055)",
              right:
                "-90px",
              top:
                "-130px",
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
                "25px",
              flexWrap:
                "wrap"
            }}
          >

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "flex-start",
                gap:
                  "15px"
              }}
            >

              <div
                style={{
                  width:
                    "50px",
                  height:
                    "50px",
                  flexShrink:
                    0,
                  borderRadius:
                    "15px",
                  background:
                    "rgba(32,199,181,0.10)",
                  border:
                    "1px solid rgba(32,199,181,0.16)",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center"
                }}
              >

                <Users
                  size={24}
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
                    color:
                      theme.primary,
                    fontSize:
                      "9px",
                    fontWeight:
                      "900",
                    letterSpacing:
                      "1.6px",
                    marginBottom:
                      "7px"
                  }}
                >

                  <Stethoscope
                    size={12}
                  />

                  CLINICAL WORKSPACE

                </div>


                <h1
                  style={{
                    margin:
                      0,
                    fontSize:
                      "clamp(26px, 4vw, 34px)",
                    lineHeight:
                      1.1,
                    fontWeight:
                      "850",
                    letterSpacing:
                      "-1px"
                  }}
                >
                  Patient Directory
                </h1>


                <p
                  style={{
                    margin:
                      "9px 0 0",
                    maxWidth:
                      "570px",
                    color:
                      theme.secondary,
                    fontSize:
                      "12px",
                    lineHeight:
                      1.7
                  }}
                >
                  Select a patient to access their
                  medical records, reports and
                  AI-assisted clinical workspace.
                </p>

              </div>

            </div>


            {/* PATIENT COUNT */}

            <div
              style={{
                minWidth:
                  "120px",
                padding:
                  "12px 14px",
                border:
                  `1px solid ${theme.borderStrong}`,
                borderRadius:
                  "13px",
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
                    "1px"
                }}
              >
                TOTAL PATIENTS
              </div>


              <div
                style={{
                  marginTop:
                    "5px",
                  fontSize:
                    "22px",
                  fontWeight:
                    "850"
                }}
              >
                {patients.length}
              </div>

            </div>

          </div>

        </section>


        {/* =================================================== */}
        {/* ACTION BAR                                             */}
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
              "12px",
            marginBottom:
              "18px",
            flexWrap:
              "wrap"
          }}
        >

          {/* SEARCH */}

          <div
            style={{
              flex:
                "1 1 320px",
              maxWidth:
                "620px",
              minWidth:
                "240px",
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "9px",
              padding:
                "11px 13px",
              border:
                `1px solid ${theme.borderStrong}`,
              borderRadius:
                "12px",
              background:
                theme.surface,
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
              placeholder="Search patients by name..."
              value={search}
              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }
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


          {/* NEW PATIENT */}

          <button
            type="button"
            onClick={
              handleNewPatient
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
                "11px",
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

            <UserPlus
              size={15}
            />

            New Patient

            <Plus
              size={13}
            />

          </button>

        </section>


        {/* =================================================== */}
        {/* RESULT INFO                                           */}
        {/* =================================================== */}

        {!loading &&
          !error &&
          patients.length > 0 && (

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                marginBottom:
                  "11px",
                gap:
                  "10px"
              }}
            >

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "7px"
                }}
              >

                <span
                  style={{
                    color:
                      theme.text,
                    fontSize:
                      "11px",
                    fontWeight:
                      "800"
                  }}
                >
                  {search
                    ? "Search Results"
                    : "All Patients"}
                </span>


                <span
                  style={{
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
                  {filteredPatients.length}
                </span>

              </div>


              {search && (

                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  style={{
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
                  Clear search
                </button>

              )}

            </div>

          )}


        {/* =================================================== */}
        {/* LOADING                                                */}
        {/* =================================================== */}

        {loading && (

          <StatusBox
            icon={Users}
            title="Loading patients"
            message="Fetching the patient directory..."
          />

        )}


        {/* =================================================== */}
        {/* ERROR                                                  */}
        {/* =================================================== */}

        {!loading &&
          error && (

            <StatusBox
              icon={AlertCircle}
              title="Unable to load patients"
              message={error}
              danger
            />

          )}


        {/* =================================================== */}
        {/* EMPTY SEARCH                                           */}
        {/* =================================================== */}

        {!loading &&
          !error &&
          filteredPatients.length === 0 && (

            <StatusBox
              icon={
                search
                  ? Search
                  : Users
              }
              title={
                search
                  ? "No patients found"
                  : "No patients available"
              }
              message={
                search
                  ? "Try searching with a different patient name."
                  : "Create a new patient to begin their clinical workspace."
              }
            />

          )}


        {/* =================================================== */}
        {/* PATIENT GRID                                           */}
        {/* =================================================== */}

        {!loading &&
          !error &&
          filteredPatients.length >
            0 && (

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap:
                  "11px"
              }}
              className="patient-grid"
            >

              {filteredPatients.map(
                patient => (

                  <PatientCard
                    key={
                      patient.id
                    }
                    patient={
                      patient
                    }
                    initials={
                      getInitials(
                        patient.name
                      )
                    }
                    onClick={() =>
                      selectPatient(
                        patient
                      )
                    }
                  />

                )
              )}

            </div>

          )}


        {/* =================================================== */}
        {/* SECURITY NOTICE                                       */}
        {/* =================================================== */}

        <section
          style={{
            marginTop:
              "24px",
            padding:
              "15px 17px",
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
              "10px"
          }}
        >

          <div
            style={{
              width:
                "30px",
              height:
                "30px",
              flexShrink:
                0,
              borderRadius:
                "9px",
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
              Protected patient workspace
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
              Patient information should only be
              accessed for authorized clinical
              purposes.
            </p>

          </div>

        </section>

      </main>


      {/* ===================================================== */}
      {/* NEW PATIENT MODAL                                       */}
      {/* ===================================================== */}

      {showForm && (

        <div
          onMouseDown={
            event => {

              if (
                event.target ===
                event.currentTarget
              ) {

                closePatientForm();

              }

            }
          }
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-patient-title"
            style={{
              width:
                "100%",
              maxWidth:
                "500px",
              background:
                theme.surface,
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
                alignItems:
                  "flex-start",
                justifyContent:
                  "space-between",
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

                  <UserPlus
                    size={12}
                  />

                  PATIENT REGISTRATION

                </div>


                <h2
                  id="new-patient-title"
                  style={{
                    margin:
                      0,
                    fontSize:
                      "20px",
                    fontWeight:
                      "800"
                  }}
                >
                  Add new patient
                </h2>


                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color:
                      theme.muted,
                    fontSize:
                      "10px",
                    lineHeight:
                      1.6
                  }}
                >
                  Enter the patient's basic
                  information to create their
                  medical workspace.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  closePatientForm
                }
                disabled={
                  creatingPatient
                }
                aria-label="Close"
                style={{
                  width:
                    "34px",
                  height:
                    "34px",
                  flexShrink:
                    0,
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
                    creatingPatient
                      ? "not-allowed"
                      : "pointer"
                }}
              >

                <X
                  size={16}
                />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                createPatient
              }
              style={{
                marginTop:
                  "21px"
              }}
            >

              {/* NAME */}

              <FormField
                label="Patient Name"
              >

                <input
                  id="patient-name"
                  name="name"
                  type="text"
                  value={
                    newPatient.name
                  }
                  onChange={
                    handlePatientInput
                  }
                  placeholder="Enter patient name"
                  disabled={
                    creatingPatient
                  }
                  autoFocus
                  style={
                    inputStyle
                  }
                />

              </FormField>


              {/* AGE */}

              <FormField
                label="Age"
              >

                <input
                  id="patient-age"
                  name="age"
                  type="number"
                  min="0"
                  value={
                    newPatient.age
                  }
                  onChange={
                    handlePatientInput
                  }
                  placeholder="Enter age"
                  disabled={
                    creatingPatient
                  }
                  style={
                    inputStyle
                  }
                />

              </FormField>


              {/* GENDER */}

              <FormField
                label="Gender"
              >

                <select
                  id="patient-gender"
                  name="gender"
                  value={
                    newPatient.gender
                  }
                  onChange={
                    handlePatientInput
                  }
                  disabled={
                    creatingPatient
                  }
                  style={
                    inputStyle
                  }
                >

                  <option value="">
                    Select gender
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Other">
                    Other
                  </option>

                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>

                </select>

              </FormField>


              {/* ERROR */}

              {formError && (

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "7px",
                    padding:
                      "10px 12px",
                    marginTop:
                      "4px",
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

                  {formError}

                </div>

              )}


              {/* ACTIONS */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "8px",
                  marginTop:
                    "19px"
                }}
              >

                <button
                  type="button"
                  onClick={
                    closePatientForm
                  }
                  disabled={
                    creatingPatient
                  }
                  style={{
                    padding:
                      "10px 14px",
                    border:
                      `1px solid ${theme.border}`,
                    borderRadius:
                      "9px",
                    background:
                      "rgba(255,255,255,0.025)",
                    color:
                      theme.secondary,
                    cursor:
                      creatingPatient
                        ? "not-allowed"
                        : "pointer",
                    fontSize:
                      "10px",
                    fontWeight:
                      "700"
                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    creatingPatient ||
                    !newPatient.name.trim()
                  }
                  style={{
                    padding:
                      "10px 15px",
                    border:
                      "none",
                    borderRadius:
                      "9px",
                    background:
                      creatingPatient ||
                      !newPatient.name.trim()
                        ? "#17302C"
                        : theme.primary,
                    color:
                      creatingPatient ||
                      !newPatient.name.trim()
                        ? theme.muted
                        : "#061412",
                    cursor:
                      creatingPatient ||
                      !newPatient.name.trim()
                        ? "not-allowed"
                        : "pointer",
                    fontSize:
                      "10px",
                    fontWeight:
                      "850"
                  }}
                >

                  {creatingPatient
                    ? "Creating..."
                    : "Create Patient"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ===================================================== */}
      {/* RESPONSIVE                                              */}
      {/* ===================================================== */}

      <style>
        {`

          @media (max-width: 950px) {

            .patient-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr)) !important;
            }

          }


          @media (max-width: 620px) {

            header {
              padding:
                0 15px !important;
            }

            .patient-grid {
              grid-template-columns:
                1fr !important;
            }

          }

        `}
      </style>

    </div>

  );

}


/* ========================================================= */
/* PATIENT CARD                                                */
/* ========================================================= */

function PatientCard({
  patient,
  initials,
  onClick
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign:
          "left",
        position:
          "relative",
        overflow:
          "hidden",
        padding:
          "17px",
        minHeight:
          "190px",
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

      {/* TOP */}

      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between"
        }}
      >

        <div
          style={{
            width:
              "45px",
            height:
              "45px",
            borderRadius:
              "14px",
            background:
              "linear-gradient(145deg, rgba(32,199,181,0.16), rgba(32,199,181,0.06))",
            border:
              "1px solid rgba(32,199,181,0.15)",
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
          {initials}
        </div>


        <div
          style={{
            width:
              "30px",
            height:
              "30px",
            borderRadius:
              "9px",
            background:
              "rgba(255,255,255,0.025)",
            border:
              `1px solid ${theme.border}`,
            color:
              theme.muted,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center"
          }}
        >

          <ArrowRight
            size={14}
          />

        </div>

      </div>


      {/* NAME */}

      <h3
        style={{
          margin:
            "17px 0 5px",
          fontSize:
            "14px",
          fontWeight:
            "800"
        }}
      >
        {patient.name}
      </h3>


      {/* DETAILS */}

      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "5px",
          color:
            theme.secondary,
          fontSize:
            "10px"
        }}
      >

        <UserRound
          size={12}
          color={
            theme.primary
          }
        />

        {patient.age !== null &&
        patient.age !== undefined
          ? `${patient.age} years`
          : "Age not provided"}

        <span>
          •
        </span>

        {patient.gender ||
          "Gender not provided"}

      </div>


      {/* PATIENT ID */}

      <div
        style={{
          marginTop:
            "12px",
          paddingTop:
            "11px",
          borderTop:
            `1px solid ${theme.border}`,
          color:
            theme.muted,
          fontSize:
            "8px",
          fontWeight:
            "700",
          letterSpacing:
            "0.5px"
        }}
      >
        PATIENT ID · {patient.id}
      </div>


      {/* LAST VISIT */}

      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "5px",
          marginTop:
            "9px",
          color:
            theme.muted,
          fontSize:
            "8px"
        }}
      >

        <CalendarDays
          size={11}
        />

        Created{" "}

        {patient.created_at
          ? new Date(
              patient.created_at
            ).toLocaleDateString()
          : "Not available"}

      </div>


      {/* BOTTOM ACTION */}

      <div
        style={{
          position:
            "absolute",
          left:
            "17px",
          right:
            "17px",
          bottom:
            "14px",
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "5px",
          color:
            theme.primary,
          fontSize:
            "9px",
          fontWeight:
            "800"
        }}
      >

        Open Clinical Workspace

        <ChevronIcon />

      </div>

    </button>

  );

}


/* ========================================================= */
/* STATUS BOX                                                  */
/* ========================================================= */

function StatusBox({
  icon: Icon,
  title,
  message,
  danger = false
}) {

  return (

    <div
      style={{
        minHeight:
          "190px",
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
        border:
          `1px solid ${
            danger
              ? "rgba(255,116,116,0.18)"
              : theme.border
          }`,
        borderRadius:
          "16px",
        background:
          danger
            ? "rgba(255,116,116,0.035)"
            : theme.surface
      }}
    >

      <div
        style={{
          width:
            "45px",
          height:
            "45px",
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
            "430px",
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

    </div>

  );

}


/* ========================================================= */
/* FORM FIELD                                                  */
/* ========================================================= */

function FormField({
  label,
  children
}) {

  return (

    <div
      style={{
        marginBottom:
          "14px"
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
            "10px",
          fontWeight:
            "800"
        }}
      >
        {label}
      </label>

      {children}

    </div>

  );

}


/* ========================================================= */
/* SHARED INPUT STYLE                                          */
/* ========================================================= */

const inputStyle = {

  width:
    "100%",

  boxSizing:
    "border-box",

  border:
    "1px solid #25534B",

  borderRadius:
    "10px",

  padding:
    "11px 12px",

  background:
    "#071613",

  color:
    "#ECF8F6",

  fontFamily:
    "inherit",

  fontSize:
    "11px",

  outline:
    "none"

};


/* ========================================================= */
/* SMALL ARROW                                                  */
/* ========================================================= */

function ChevronIcon() {

  return (

    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path
        d="m9 18 6-6-6-6"
      />

    </svg>

  );

}