import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("campusUser"));

    if (!savedUser) {
      setMessage("No account found. Please register first.");
      return;
    }

    if (email === savedUser.email && password === savedUser.password) {
      setMessage("Login successful! Welcome to Campus Connect.");

      localStorage.setItem("isLoggedIn", "true");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      setMessage("Incorrect email or password.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-box">
        <h1>Login</h1>
        <p>Login to Campus Connect Portal</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit">Login</button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        <Link to="/" className="back-link">
          ← Back to Campus Connect
        </Link>
      </div>
    </main>
  );
}

export default Login;