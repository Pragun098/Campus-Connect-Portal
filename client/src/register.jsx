import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const portal = location.state?.portal;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, portal })
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Unable to create your account.");
        return;
      }

      setMessage("Registration successful. Sign in with your new account.");
      navigate("/login", { state: location.state });
    } catch {
      setMessage("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-box">
        <h1>Create Account</h1>
        <p>
          {portal
            ? portal === "student"
              ? "Create your student account"
              : `Faculty and administration accounts must be created by an administrator.`
            : "Choose a portal from the home page to create your account"}
        </p>

        <form onSubmit={handleRegister}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            autoComplete="name"
            required
            onChange={(event) => setName(event.target.value)}
          />

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
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-link">
          Already have an account?{" "}
          <Link to="/login" state={location.state}>
            Login
          </Link>
        </p>

        <Link to="/" className="back-link">
          ← Back to Campus Connect
        </Link>
      </div>
    </main>
  );
}

export default Register;