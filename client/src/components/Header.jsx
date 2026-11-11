import { useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("campusAuthUser"))
  );
  const [logoutMessage, setLogoutMessage] = useState("");
  const activePortal = localStorage.getItem("campusActivePortal");
  const portalPath = activePortal ? `/${activePortal}-portal` : "/";

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok && response.status !== 401) {
        const result = await response.json();
        setLogoutMessage(result.message || "Unable to sign out.");
        return;
      }
    } catch {
      setLogoutMessage("Could not reach the server to sign out. Please try again.");
      return;
    }

    localStorage.removeItem("campusAuthUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("campusActivePortal");
    setIsLoggedIn(false);
  }

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

        {isLoggedIn && (
          <>
            <Link to={portalPath} className="login-link">
              My portal
            </Link>
            <button className="header-logout" onClick={handleLogout}>
              Log out
            </button>
          </>
        )}
      </nav>
      {logoutMessage && <p role="alert">{logoutMessage}</p>}
    </header>
  );
}

export default Header;