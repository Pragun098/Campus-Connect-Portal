import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiUrl } from "./api.js";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialPortal = location.state?.portal || "";
  const [selectedPortal, setSelectedPortal] = useState(initialPortal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const portalPaths = {
    student: "/student-portal",
    faculty: "/faculty-portal",
    administration: "/administration-portal"
  };

  const demoAccounts = [
    {
      role: "Student",
      portal: "student",
      email: "student@campus.edu",
      pass: "student123",
      icon: "🎓",
      desc: "Course list, attendance & notices"
    },
    {
      role: "Faculty",
      portal: "faculty",
      email: "faculty@campus.edu",
      pass: "faculty123",
      icon: "👨‍🏫",
      desc: "Post assignments & mark attendance"
    },
    {
      role: "Admin",
      portal: "administration",
      email: "admin@campus.edu",
      pass: "admin123",
      icon: "🛡️",
      desc: "Publish notices & manage staff"
    }
  ];

  function fillDemo(acc) {
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedPortal(acc.portal);
    setMessage("");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const payload = {
        email: email.trim(),
        password
      };
      // Only include portal if explicitly filtered by user
      if (selectedPortal) {
        payload.portal = selectedPortal;
      }

      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.message && result.message.includes("is registered for the")) {
          setMessage(`${result.message} Choose "Auto-Detect" or click that portal above.`);
        } else {
          setMessage(result.message || "Unable to sign in. Please verify your credentials.");
        }
        return;
      }

      const user = result.user;
      const destination = portalPaths[user.portal];
      if (!destination) {
        setMessage("This account has an unsupported portal. Please contact an administrator.");
        return;
      }

      localStorage.setItem("campusAuthUser", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("campusActivePortal", user.portal);
      window.dispatchEvent(new Event("storage"));

      navigate(destination, { replace: true });
    } catch {
      setMessage("Could not reach the authentication server. Check the deployed API URL and server CORS settings.");
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

        <h1>Campus Sign In</h1>
        <p className="auth-subtitle">
          {selectedPortal
            ? `Signing in to ${selectedPortal.charAt(0).toUpperCase() + selectedPortal.slice(1)} Portal`
            : "Sign in to access your Campus Connect account"}
        </p>

        {/* Portal Filter Selector */}
        <div className="portal-selector-tabs" role="tablist" aria-label="Target Portal">
          <button
            type="button"
            className={`portal-tab-btn ${selectedPortal === "" ? "active" : ""}`}
            onClick={() => { setSelectedPortal(""); setMessage(""); }}
          >
            Auto-Detect
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${selectedPortal === "student" ? "active" : ""}`}
            onClick={() => { setSelectedPortal("student"); setMessage(""); }}
          >
            Student
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${selectedPortal === "faculty" ? "active" : ""}`}
            onClick={() => { setSelectedPortal("faculty"); setMessage(""); }}
          >
            Faculty
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${selectedPortal === "administration" ? "active" : ""}`}
            onClick={() => { setSelectedPortal("administration"); setMessage(""); }}
          >
            Admin
          </button>
        </div>

        {/* 1-Click Quick Demo Credentials */}
        <div className="demo-credentials-card">
          <div className="demo-card-heading">
            <span className="demo-icon">⚡</span>
            <span>Quick Demo Logins (Click to Fill):</span>
          </div>
          <div className="demo-chips-grid">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                className={`demo-chip-btn ${email === acc.email ? "demo-chip-active" : ""}`}
                onClick={() => fillDemo(acc)}
                title={acc.desc}
              >
                <span className="chip-icon">{acc.icon}</span>
                <span className="chip-name">{acc.role}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <label htmlFor="login-email">Campus Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="e.g. student@campus.edu"
            value={email}
            autoComplete="email"
            required
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="login-password">Password</label>
          <div className="password-input-wrapper">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              autoComplete="current-password"
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
            {isSubmitting ? "Authenticating..." : "Sign In to Portal →"}
          </button>
        </form>

        {message && (
          <div className="auth-message-box error" role="alert">
            <span className="msg-icon">⚠️</span>
            <span>{message}</span>
          </div>
        )}

        <div className="auth-footer-links">
          <p className="auth-link">
            Need an account?{" "}
            <Link to="/register" state={{ portal: selectedPortal || "student" }}>
              Register as Student
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

export default Login;
