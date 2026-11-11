import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiUrl } from "./api.js";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const portal = location.state?.portal || "student";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          portal: "student" // Self-registration is for student portal
        })
      });

      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Unable to create your account.");
        return;
      }

      setIsSuccess(true);
      setMessage("Account created successfully! Redirecting you to login...");
      setTimeout(() => {
        navigate("/login", { state: { portal: "student" } });
      }, 1500);
    } catch {
      setMessage("Could not reach the registration server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-box auth-box-enhanced">
        <div className="auth-brand-badge">
          <span>RV</span>
        </div>

        <h1>Create Student Account</h1>
        <p className="auth-subtitle">
          Join RV University Campus Connect to track courses, assignments, and campus updates.
        </p>

        {portal !== "student" && (
          <div className="auth-info-note">
            <span>ℹ️ Faculty & Administrator accounts are provisioned by Campus Administration. Use the demo accounts on the login screen or register below as a Student.</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <label htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            placeholder="e.g. Alex Johnson"
            value={name}
            autoComplete="name"
            required
            onChange={(event) => setName(event.target.value)}
          />

          <label htmlFor="reg-email">Campus Email</label>
          <input
            id="reg-email"
            type="email"
            placeholder="e.g. alex@campus.edu"
            value={email}
            autoComplete="email"
            required
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="reg-password">Password (min 8 characters)</label>
          <div className="password-input-wrapper">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a secure password"
              value={password}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️ Hide" : "👁️ Show"}
            </button>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Creating Student Account..." : "Create Account →"}
          </button>
        </form>

        {message && (
          <div className={`auth-message-box ${isSuccess ? "success" : "error"}`} role="alert">
            <span className="msg-icon">{isSuccess ? "✅" : "⚠️"}</span>
            <span>{message}</span>
          </div>
        )}

        <div className="auth-footer-links">
          <p className="auth-link">
            Already have an account?{" "}
            <Link to="/login" state={{ portal }}>
              Sign In
            </Link>
          </p>

          <Link to="/" className="back-link">
            ← Return to Campus Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Register;
