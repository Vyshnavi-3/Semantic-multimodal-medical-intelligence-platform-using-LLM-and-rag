import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";

export default function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [patientId, setPatientId] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleRegister(e) {

    e.preventDefault();

    setError("");
    setSuccess("");


    // --------------------------------------------
    // PASSWORD VALIDATION
    // --------------------------------------------

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters"
      );
      return;
    }


    // --------------------------------------------
    // PATIENT ID VALIDATION
    // --------------------------------------------

    if (
      role === "patient" &&
      !patientId.trim()
    ) {
      setError(
        "Patient ID is required for a patient account"
      );
      return;
    }


    setLoading(true);


    try {

      const requestBody = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: role
      };


      // Patient accounts must be linked
      // to an existing patient record.

      if (role === "patient") {
        requestBody.patient_id =
          Number(patientId);
      }


      const response = await fetch(
        "http://127.0.0.1:8000/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(requestBody)
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail || "Registration failed"
        );

      }


      setSuccess(
        "Account created successfully! Redirecting to login..."
      );


      setTimeout(() => {
        navigate("/");
      }, 1500);


    } catch (error) {

      setError(
        error.message ||
        "Registration failed"
      );

    } finally {

      setLoading(false);

    }
  }


  return (

    <div className="login-page">

      {/* LEFT SIDE */}

      <div className="login-left">

        <div className="login-brand">

          <div className="brand-logo">
            M
          </div>

          <div>

            <h2>
              Mediora
            </h2>

            <span>
              Medical Intelligence
            </span>

          </div>

        </div>


        <div className="login-message">

          <p className="eyebrow">
            INTELLIGENCE THAT STAYS HUMAN
          </p>

          <h1>
            Begin your
            <br />
            journey to clarity.
          </h1>

          <p>
            Create your secure workspace to connect
            medical images, reports, documents
            and clinical context.
          </p>

        </div>


        <div className="login-footer">

          <span>

            <ShieldCheck size={15} />

            Secure clinical workspace

          </span>


          <span>
            © 2026 Mediora Health Systems
          </span>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="login-right">

        <div className="login-card">


          <div className="mobile-logo">

            <div className="brand-logo">
              M
            </div>

            <strong>
              Mediora
            </strong>

          </div>


          <p className="eyebrow">
            GET STARTED
          </p>


          <h2>
            Create your account
          </h2>


          <p className="login-description">
            Create an account to access your
            medical intelligence workspace.
          </p>


          <form onSubmit={handleRegister}>


            {/* ERROR */}

            {error && (

              <div className="login-error">
                {error}
              </div>

            )}


            {/* SUCCESS */}

            {success && (

              <div className="login-success">
                {success}
              </div>

            )}


            {/* NAME */}

            <label>
              Full name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />


            {/* EMAIL */}

            <label>
              Work email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />


            {/* ROLE */}

            <label>
              Account type
            </label>

            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPatientId("");
              }}
              required
            >
              <option value="patient">
                Patient
              </option>

              <option value="doctor">
                Doctor
              </option>
            </select>


            {/* PATIENT ID */}

            {role === "patient" && (

              <>
                <label>
                  Patient ID
                </label>

                <input
                  type="number"
                  placeholder="Enter your patient ID"
                  value={patientId}
                  onChange={(e) =>
                    setPatientId(e.target.value)
                  }
                  min="1"
                  required
                />

                <p className="login-description">
                  Enter the Patient ID assigned to
                  your medical record.
                </p>
              </>

            )}


            {/* PASSWORD */}

            <div className="password-label">

              <label>
                Password
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>


            <div className="password-input">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />}
              </button>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="password-label">

              <label>
                Confirm password
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>


            <div className="password-input">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />}
              </button>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? "Creating account..."
                : "Create account"}

              {!loading && (
                <ArrowRight size={18} />
              )}

            </button>

          </form>


          {/* LOGIN LINK */}

          <div className="signup-text">

            Already have an account?

            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Sign in
            </button>

          </div>


          {/* SECURITY */}

          <div className="login-security">

            <ShieldCheck size={17} />

            <span>
              Protected by enterprise-grade
              security and privacy controls.
            </span>

          </div>


        </div>

      </div>

    </div>
  );
}