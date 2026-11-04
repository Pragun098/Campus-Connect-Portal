import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleRegister(event) {
    event.preventDefault();

    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
      setMessage("Please fill all the fields.");
      return;
    }

    const user = {
      name: name,
      email: email,
      password: password
    };

    localStorage.setItem("campusUser", JSON.stringify(user));

    setMessage("Registration successful! Redirecting to login...");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  }

  return (
    <main className="auth-page">
      <div className="auth-box">
        <h1>Create Account</h1>
        <p>Register for Campus Connect Portal</p>

        <form onSubmit={handleRegister}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

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

          <button type="submit">Register</button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <Link to="/" className="back-link">
          ← Back to Campus Connect
        </Link>
      </div>
    </main>
  );
}

export default Register;