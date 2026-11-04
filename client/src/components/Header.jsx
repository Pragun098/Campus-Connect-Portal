import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="portal-header">
      <a className="university-brand" href="#home">
        <span className="university-badge">RV</span>

        <span>
          <strong>RV UNIVERSITY</strong>
          <small>School of Computer Science & Engineering</small>
        </span>
      </a>

      <nav>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>

        <Link to="/login" className="login-link">
          Login
        </Link>

        <Link to="/register" className="register-link">
          Register
        </Link>
      </nav>
    </header>
  );
}

export default Header;