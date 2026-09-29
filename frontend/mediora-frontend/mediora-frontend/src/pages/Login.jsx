import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  LockKeyhole,
  Activity,
  FileText,
  Brain,
  Stethoscope
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [remember, setRemember] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [developmentOtp, setDevelopmentOtp] =
    useState("");

  // =====================================================
  // LOGIN
  // =====================================================

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed"
        );
      }

      if (!data.user) {
        throw new Error(
          "Invalid login response from server"
        );
      }

      localStorage.setItem(
        "mediora_user",
        JSON.stringify(data)
      );

      if (data.user.role === "doctor") {
        navigate("/doctor");
      } else if (data.user.role === "patient") {
        localStorage.setItem(
          "selectedPatient",
          JSON.stringify({
            id: data.user.patient_id,
            name: data.user.name
          })
        );

        navigate("/patient");
      } else {
        throw new Error(
          "Invalid user role"
        );
      }
    } catch (error) {
      setError(
        error.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // OPEN FORGOT PASSWORD
  // =====================================================

  function openForgotPassword() {
    setMode("forgot");
    setError("");
    setSuccess("");

    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setDevelopmentOtp("");
  }

  // =====================================================
  // REQUEST PASSWORD RESET OTP
  // =====================================================

  async function handleForgotPassword(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to generate password reset OTP"
        );
      }

      setDevelopmentOtp(
        data.otp || ""
      );

      setSuccess(
        "A password reset OTP has been generated."
      );

      setMode("reset");
    } catch (error) {
      setError(
        error.message ||
          "Unable to reset password"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  async function handleResetPassword(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError(
        "Please enter the 6-digit OTP"
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters"
      );
      return;
    }

    if (
      newPassword !==
      confirmNewPassword
    ) {
      setError(
        "Passwords do not match"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp,
            new_password: newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Password reset failed"
        );
      }

      setSuccess(
        "Password reset successfully. You can now sign in."
      );

      setPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setOtp("");
      setDevelopmentOtp("");

      setTimeout(() => {
        setMode("login");
        setSuccess("");
      }, 1800);
    } catch (error) {
      setError(
        error.message ||
          "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // BACK TO LOGIN
  // =====================================================

  function backToLogin() {
    setMode("login");
    setError("");
    setSuccess("");

    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setDevelopmentOtp("");
  }

  return (
    <div className="mediora-login">

      {/* =================================================
          PAGE STYLE
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .mediora-login {
          min-height: 100vh;
          width: 100%;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          background: #071413;
          color: #ecf8f6;
          font-family: "DM Sans", Arial, sans-serif;
          overflow: hidden;
        }

        /* =================================================
           LEFT PANEL
        ================================================= */

        .login-visual {
          position: relative;
          min-height: 100vh;
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(32, 199, 181, 0.16),
              transparent 32%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(32, 199, 181, 0.08),
              transparent 30%
            ),
            #071413;
          border-right: 1px solid #1c3834;
        }

        .login-visual::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          border: 1px solid rgba(32, 199, 181, 0.10);
          top: 18%;
          left: 18%;
          pointer-events: none;
        }

        .login-visual::after {
          content: "";
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          border: 1px solid rgba(32, 199, 181, 0.05);
          top: 7%;
          left: 4%;
          pointer-events: none;
        }

        .brand {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-mark {
          width: 52px;
          height: 52px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #20c7b5,
            #0c8e83
          );
          color: #071413;
          font-size: 25px;
          font-weight: 800;
          box-shadow:
            0 10px 35px rgba(
              32,
              199,
              181,
              0.18
            );
        }

        .brand-name {
          display: flex;
          flex-direction: column;
        }

        .brand-name strong {
          font-family: "Manrope", Arial, sans-serif;
          font-size: 24px;
          line-height: 1;
          color: #ecf8f6;
        }

        .brand-name span {
          margin-top: 6px;
          color: #71908b;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 700;
        }

        .visual-content {
          position: relative;
          z-index: 2;
          max-width: 590px;
          margin-top: auto;
          margin-bottom: auto;
        }

        .visual-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: #20c7b5;
          font-size: 11px;
          letter-spacing: 2px;
          font-weight: 800;
        }

        .visual-content h1 {
          margin: 0;
          font-family: "Manrope", Arial, sans-serif;
          font-size: clamp(
            46px,
            5vw,
            72px
          );
          line-height: 1.02;
          letter-spacing: -2.5px;
          color: #ecf8f6;
        }

        .visual-content h1 span {
          color: #20c7b5;
        }

        .visual-content > p {
          max-width: 500px;
          margin: 26px 0 0;
          color: #91aaa6;
          font-size: 16px;
          line-height: 1.8;
        }

        /* =================================================
           FEATURE ITEMS
        ================================================= */

        .feature-list {
          display: grid;
          grid-template-columns: repeat(
            3,
            1fr
          );
          gap: 12px;
          margin-top: 38px;
        }

        .feature {
          padding: 18px 14px;
          border: 1px solid #1c3834;
          border-radius: 14px;
          background: rgba(
            13,
            31,
            29,
            0.70
          );
          backdrop-filter: blur(12px);
        }

        .feature-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #123b36;
          color: #20c7b5;
          margin-bottom: 12px;
        }

        .feature strong {
          display: block;
          font-size: 12px;
          color: #dcece9;
        }

        .feature span {
          display: block;
          margin-top: 5px;
          color: #718b86;
          font-size: 10px;
          line-height: 1.4;
        }

        .visual-footer {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #617c77;
          font-size: 10px;
        }

        .secure-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #8ca9a4;
        }

        .secure-label svg {
          color: #20c7b5;
        }

        /* =================================================
           RIGHT LOGIN PANEL
        ================================================= */

        .login-form-panel {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #081816;
          overflow-y: auto;
        }

        .login-card {
          width: 100%;
          max-width: 455px;
          padding: 42px;
          border: 1px solid #1c3834;
          border-radius: 24px;
          background: #0d1f1d;
          box-shadow:
            0 25px 70px rgba(
              0,
              0,
              0,
              0.28
            );
        }

        .mobile-brand {
          display: none;
        }

        .form-eyebrow {
          margin: 0 0 12px;
          color: #20c7b5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .login-card h2 {
          margin: 0;
          font-family: "Manrope", Arial, sans-serif;
          font-size: 30px;
          line-height: 1.2;
          letter-spacing: -0.8px;
          color: #ecf8f6;
        }

        .form-description {
          margin: 12px 0 30px;
          color: #91aaa6;
          font-size: 13px;
          line-height: 1.65;
        }

        /* =================================================
           MESSAGES
        ================================================= */

        .form-message {
          padding: 12px 14px;
          margin-bottom: 18px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.5;
        }

        .form-error {
          background: rgba(
            205,
            76,
            76,
            0.10
          );
          border: 1px solid rgba(
            205,
            76,
            76,
            0.25
          );
          color: #ffaaa6;
        }

        .form-success {
          background: rgba(
            32,
            199,
            181,
            0.08
          );
          border: 1px solid rgba(
            32,
            199,
            181,
            0.20
          );
          color: #76ddd0;
        }

        /* =================================================
           FORM
        ================================================= */

        .form-group {
          margin-bottom: 20px;
        }

        .form-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .form-label-row label,
        .form-group > label {
          display: block;
          margin-bottom: 8px;
          color: #c8d9d6;
          font-size: 11px;
          font-weight: 700;
        }

        .form-label-row label {
          margin-bottom: 0;
        }

        .form-control {
          width: 100%;
          height: 50px;
          padding: 0 15px;
          border: 1px solid #284640;
          border-radius: 11px;
          outline: none;
          background: #091a18;
          color: #ecf8f6;
          font-family: inherit;
          font-size: 13px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .form-control::placeholder {
          color: #5f7773;
        }

        .form-control:focus {
          border-color: #20c7b5;
          background: #0a1d1a;
          box-shadow:
            0 0 0 3px rgba(
              32,
              199,
              181,
              0.08
            );
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper .form-control {
          padding-right: 50px;
        }

        .password-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #71908b;
          cursor: pointer;
        }

        .password-toggle:hover {
          background: #123b36;
          color: #20c7b5;
        }

        .show-button {
          border: none;
          background: transparent;
          color: #20c7b5;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .show-button:hover {
          color: #67e1d4;
        }

        /* =================================================
           OPTIONS
        ================================================= */

        .login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 4px 0 22px;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #819b96;
          font-size: 11px;
          cursor: pointer;
        }

        .remember input {
          width: 15px;
          height: 15px;
          margin: 0;
          accent-color: #20c7b5;
          cursor: pointer;
        }

        .forgot-link {
          border: none;
          padding: 0;
          background: transparent;
          color: #20c7b5;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .forgot-link:hover {
          color: #70e1d6;
        }

        /* =================================================
           PRIMARY BUTTON
        ================================================= */

        .primary-button {
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          border-radius: 11px;
          background: linear-gradient(
            135deg,
            #20c7b5,
            #0ea092
          );
          color: #061311;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 10px 25px rgba(
              32,
              199,
              181,
              0.14
            );
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 14px 30px rgba(
              32,
              199,
              181,
              0.20
            );
        }

        .primary-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* =================================================
           SIGN UP
        ================================================= */

        .signup {
          margin-top: 25px;
          padding-top: 22px;
          border-top: 1px solid #1c3834;
          text-align: center;
          color: #718b86;
          font-size: 11px;
        }

        .signup button {
          margin-left: 5px;
          border: none;
          padding: 0;
          background: transparent;
          color: #20c7b5;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .signup button:hover {
          color: #70e1d6;
        }

        /* =================================================
           BACK BUTTON
        ================================================= */

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 25px;
          border: none;
          padding: 0;
          background: transparent;
          color: #819b96;
          font-family: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        .back-button:hover {
          color: #20c7b5;
        }

        /* =================================================
           OTP
        ================================================= */

        .otp-box {
          text-align: center;
          letter-spacing: 4px;
          font-size: 18px;
          font-weight: 800;
          color: #20c7b5;
        }

        /* =================================================
           SECURITY
        ================================================= */

        .login-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 24px;
          color: #607b76;
          font-size: 9px;
          line-height: 1.5;
          text-align: center;
        }

        .login-security svg {
          flex-shrink: 0;
          color: #20c7b5;
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 900px) {
          .mediora-login {
            grid-template-columns: 1fr;
          }

          .login-visual {
            display: none;
          }

          .login-form-panel {
            min-height: 100vh;
            padding: 25px 18px;
            align-items: center;
          }

          .login-card {
            max-width: 500px;
            padding: 30px 24px;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 32px;
          }

          .mobile-brand .brand-mark {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            font-size: 20px;
          }

          .mobile-brand strong {
            font-family: "Manrope", Arial, sans-serif;
            font-size: 21px;
            color: #ecf8f6;
          }
        }

        @media (max-width: 480px) {
          .login-form-panel {
            padding: 15px;
          }

          .login-card {
            padding: 25px 19px;
            border-radius: 19px;
          }

          .login-card h2 {
            font-size: 25px;
          }

          .login-options {
            align-items: flex-start;
            gap: 12px;
            flex-direction: column;
          }
        }

      `}</style>

      {/* =================================================
          LEFT VISUAL PANEL
      ================================================= */}

      <section className="login-visual">

        <div className="brand">
          <div className="brand-mark">
            M
          </div>

          <div className="brand-name">
            <strong>Mediora</strong>
            <span>
              Medical Intelligence
            </span>
          </div>
        </div>

        <div className="visual-content">

          <div className="visual-eyebrow">
            <Activity size={15} />
            INTELLIGENCE THAT STAYS HUMAN
          </div>

          <h1>
            Care, with
            <br />
            <span>more clarity.</span>
          </h1>

          <p>
            Connect medical reports, documents,
            clinical information and AI-powered
            intelligence in one secure healthcare
            workspace.
          </p>

          <div className="feature-list">

            <div className="feature">
              <div className="feature-icon">
                <FileText size={17} />
              </div>

              <strong>
                Medical Records
              </strong>

              <span>
                Organized patient information
              </span>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <Brain size={17} />
              </div>

              <strong>
                AI Intelligence
              </strong>

              <span>
                Context-aware medical assistance
              </span>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <Stethoscope size={17} />
              </div>

              <strong>
                Clinical Workspace
              </strong>

              <span>
                Built for patients and doctors
              </span>
            </div>

          </div>

        </div>

        <div className="visual-footer">

          <div className="secure-label">
            <ShieldCheck size={15} />
            Secure clinical workspace
          </div>

          <span>
            © 2026 Mediora Health Systems
          </span>

        </div>

      </section>

      {/* =================================================
          RIGHT FORM PANEL
      ================================================= */}

      <section className="login-form-panel">

        <div className="login-card">

          {/* MOBILE BRAND */}

          <div className="mobile-brand">
            <div className="brand-mark">
              M
            </div>

            <strong>
              Mediora
            </strong>
          </div>

          {/* =================================================
              LOGIN
          ================================================= */}

          {mode === "login" && (
            <>
              <p className="form-eyebrow">
                WELCOME BACK
              </p>

              <h2>
                Sign in to your workspace
              </h2>

              <p className="form-description">
                Access your patient records and
                medical intelligence tools.
              </p>

              <form onSubmit={handleLogin}>

                {error && (
                  <div className="form-message form-error">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="form-message form-success">
                    {success}
                  </div>
                )}

                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Work email
                  </label>

                  <input
                    className="form-control"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                {/* PASSWORD */}

                <div className="form-group">

                  <div className="form-label-row">

                    <label>
                      Password
                    </label>

                    <button
                      type="button"
                      className="show-button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                  <div className="password-wrapper">

                    <input
                      className="form-control"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* OPTIONS */}

                <div className="login-options">

                  <label className="remember">

                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) =>
                        setRemember(
                          e.target.checked
                        )
                      }
                    />

                    Remember me

                  </label>

                  <button
                    type="button"
                    className="forgot-link"
                    onClick={
                      openForgotPassword
                    }
                  >
                    Forgot password?
                  </button>

                </div>

                {/* SIGN IN */}

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >

                  {loading
                    ? "Signing in..."
                    : "Sign in"}

                  {!loading && (
                    <ArrowRight size={18} />
                  )}

                </button>

              </form>

              <div className="signup">

                New to Mediora?

                <button
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
                >
                  Create an account
                </button>

              </div>
            </>
          )}

          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          {mode === "forgot" && (
            <>
              <button
                type="button"
                className="back-button"
                onClick={backToLogin}
              >
                <ArrowLeft size={15} />
                Back to sign in
              </button>

              <p className="form-eyebrow">
                PASSWORD RECOVERY
              </p>

              <h2>
                Forgot your password?
              </h2>

              <p className="form-description">
                Enter your registered email
                address to generate a password
                reset OTP.
              </p>

              <form
                onSubmit={
                  handleForgotPassword
                }
              >

                {error && (
                  <div className="form-message form-error">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="form-message form-success">
                    {success}
                  </div>
                )}

                <div className="form-group">

                  <label>
                    Registered email
                  </label>

                  <input
                    className="form-control"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >

                  {loading
                    ? "Generating OTP..."
                    : "Continue"}

                  {!loading && (
                    <ArrowRight size={18} />
                  )}

                </button>

              </form>
            </>
          )}

          {/* =================================================
              RESET PASSWORD
          ================================================= */}

          {mode === "reset" && (
            <>
              <button
                type="button"
                className="back-button"
                onClick={backToLogin}
              >
                <ArrowLeft size={15} />
                Back to sign in
              </button>

              <p className="form-eyebrow">
                RESET PASSWORD
              </p>

              <h2>
                Create a new password
              </h2>

              <p className="form-description">
                Enter the OTP and choose a new
                password for your account.
              </p>

              {error && (
                <div className="form-message form-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="form-message form-success">
                  {success}
                </div>
              )}

              {/* DEVELOPMENT OTP */}

              {developmentOtp && (
                <div className="form-message form-success">
                  <strong>
                    Development OTP:
                  </strong>

                  <div
                    style={{
                      marginTop: "7px",
                      fontSize: "18px",
                      letterSpacing: "4px"
                    }}
                  >
                    {developmentOtp}
                  </div>
                </div>
              )}

              <form
                onSubmit={
                  handleResetPassword
                }
              >

                {/* OTP */}

                <div className="form-group">

                  <label>
                    One-time password
                  </label>

                  <input
                    className="form-control otp-box"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    required
                  />

                </div>

                {/* NEW PASSWORD */}

                <div className="form-group">

                  <div className="form-label-row">

                    <label>
                      New password
                    </label>

                    <button
                      type="button"
                      className="show-button"
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                    >
                      {showNewPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                  <div className="password-wrapper">

                    <input
                      className="form-control"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}

                <div className="form-group">

                  <div className="form-label-row">

                    <label>
                      Confirm new password
                    </label>

                    <button
                      type="button"
                      className="show-button"
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

                  <div className="password-wrapper">

                    <input
                      className="form-control"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm new password"
                      value={
                        confirmNewPassword
                      }
                      onChange={(e) =>
                        setConfirmNewPassword(
                          e.target.value
                        )
                      }
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >

                  {loading
                    ? "Resetting password..."
                    : "Reset password"}

                  {!loading && (
                    <ArrowRight size={18} />
                  )}

                </button>

              </form>
            </>
          )}

          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="login-security">

            <LockKeyhole size={14} />

            <span>
              Protected by secure authentication
              and privacy controls.
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}