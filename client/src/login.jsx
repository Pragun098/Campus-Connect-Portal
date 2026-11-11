import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const portal = location.state?.portal;
  const portalPaths = {
    student: "/student-portal",
    faculty: "/faculty-portal",
    administration: "/administration-portal"
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(portal ? { portal } : {}) })
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Unable to sign in.");
        return;
      }

      const destination = portalPaths[result.user.portal];
      if (!destination) {
        setMessage("This account has an unsupported portal. Contact an administrator.");
        return;
      }

      localStorage.setItem("campusAuthUser", JSON.stringify(result.user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("campusActivePortal", result.user.portal);
      navigate(destination, { replace: true });
    } catch {
      setMessage("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-box">
        <h1>Login</h1>
        <p>
          {portal
            ? `Sign in to your ${portal} portal`
            : "Login to Campus Connect Portal"}
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            autoComplete="email"
            required
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            autoComplete="current-password"
            required
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-link">
          Don't have an account?{" "}
          <Link to="/register" state={location.state}>
            Register
          </Link>
        </p>

        <Link to="/" className="back-link">
          ← Back to Campus Connect
        </Link>
      </div>
    </main>
  );
}

export default Login;