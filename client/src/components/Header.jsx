import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../api.js";

function Header() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("campusAuthUser") || "null");
    } catch {
      return null;
    }
  });
  const [logoutMessage, setLogoutMessage] = useState("");

  useEffect(() => {
    function syncAuth() {
      try {
        setUser(JSON.parse(localStorage.getItem("campusAuthUser") || "null"));
      } catch {
        setUser(null);
      }
    }
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const isLoggedIn = Boolean(user);
  const portalPath = user?.portal ? `/${user.portal}-portal` : "/";

  async function handleLogout() {
    try {
      const response = await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok && response.status !== 401) {
        const result = await response.json();
        setLogoutMessage(result.message || "Unable to sign out.");
        return;
      }
    } catch {
      // Ignore network errors on signout and clean local state
    }

    localStorage.removeItem("campusAuthUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("campusActivePortal");
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="portal-header">
      <Link className="university-brand" to="/">
        <span className="university-badge">RV</span>
        <span>
          <strong>RV UNIVERSITY</strong>
          <small>School of Computer Science & Engineering</small>
        </span>
      </Link>

      <nav className="header-nav">
        <a href="#roles">Portals</a>
        <a href="#gallery">Campus Life</a>
        <a href="#about">About</a>

        {isLoggedIn ? (
          <div className="header-auth-group">
            <span className="user-pill-tag">
              <span className="user-pill-avatar">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </span>
              <span className="user-pill-name">{user?.name}</span>
              <span className={`portal-tag-badge portal-tag-${user?.portal}`}>
                {user?.portal}
              </span>
            </span>

            <Link to={portalPath} className="header-portal-btn">
              Dashboard →
            </Link>

            <button
              type="button"
              className="header-logout-btn"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="header-auth-group">
            <Link to="/login" className="header-signin-btn">
              Sign In
            </Link>
            <Link to="/register" className="header-register-btn">
              Register
            </Link>
          </div>
        )}
      </nav>

      {logoutMessage && <p className="header-logout-error" role="alert">{logoutMessage}</p>}
    </header>
  );
}

export default Header;
