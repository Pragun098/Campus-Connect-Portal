import "./App.css";

import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  Link
} from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./login.jsx";
import Register from "./register.jsx";

import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import CampusGallery from "./components/CampusGallery.jsx";
import PortalCard from "./components/PortalCard.jsx";
import PortalPage from "./components/PortalPage.jsx";
import { apiUrl } from "./api.js";

function RequireAuth({ children, portal }) {
  const [status, setStatus] = useState(
    localStorage.getItem("campusAuthUser") ? "checking" : "unauthenticated"
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("campusAuthUser") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!localStorage.getItem("campusAuthUser")) {
      return;
    }

    fetch(apiUrl("/api/auth/me"), { credentials: "include" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("campusAuthUser");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("campusActivePortal");
            setStatus("unauthenticated");
          } else {
            // Check if cached user exists
            const cached = localStorage.getItem("campusAuthUser");
            if (cached) {
              try {
                setUser(JSON.parse(cached));
                setStatus("authorized");
                return;
              } catch (parseErr) {
                void parseErr;
              }
            }
            setStatus("error");
          }
          return;
        }

        localStorage.setItem("campusAuthUser", JSON.stringify(result.user));
        localStorage.setItem("campusActivePortal", result.user.portal);
        setUser(result.user);
        setStatus("authorized");
      })
      .catch(() => {
        const cached = localStorage.getItem("campusAuthUser");
        if (cached) {
          try {
            setUser(JSON.parse(cached));
            setStatus("authorized");
            return;
          } catch (parseErr) {
            void parseErr;
          }
        }
        setStatus("error");
      });
  }, []);

  if (status === "checking") {
    return (
      <main className="auth-page">
        <div className="auth-box auth-status-box">
          <div className="auth-spinner" />
          <p>Verifying campus credentials...</p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="auth-page">
        <div className="auth-box auth-status-box">
          <h2>Authentication Notice</h2>
          <p role="alert">Unable to verify your sign-in session with the campus server.</p>
          <div className="auth-recovery-actions">
            <Link
              to="/login"
              className="auth-submit-btn"
              onClick={() => {
                localStorage.removeItem("campusAuthUser");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("campusActivePortal");
              }}
            >
              Sign In Again
            </Link>
            <Link to="/" className="back-link">
              ← Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={portal ? { portal } : undefined}
      />
    );
  }

  if (portal && user && user.portal !== portal) {
    return <Navigate to={`/${user.portal}-portal`} replace />;
  }

  return children;
}

function Home() {
  return (
    <main className="portal-page">
      <Header />

      <Hero />

      {/* Horizontal Scrolling Campus Images Section */}
      <CampusGallery />

      <section className="roles-section" id="roles">
        <p className="section-kicker">
          CAMPUS CONNECT PORTALS
        </p>

        <h2>
          Access Your Dedicated Workspace
        </h2>

        <p className="section-intro">
          Streamlined access tailored for students, faculty members, and campus administrative staff.
        </p>

        <div className="role-grid">
          <PortalCard
            title="Student Portal"
            description="Access course schedules, monitor real-time attendance, and view academic assignments."
            icon="🎓"
            className=""
            to="/student-portal"
          />

          <PortalCard
            title="Faculty Portal"
            description="Publish course assignments, record classroom attendance, and manage student rosters."
            icon="👨‍🏫"
            className="faculty-icon"
            to="/faculty-portal"
          />

          <PortalCard
            title="Administration Portal"
            description="Broadcast campus-wide notices, oversee staff accounts, and monitor academic records."
            icon="🛡️"
            className="admin-icon"
            to="/administration-portal"
          />
        </div>
      </section>

      <footer id="about">
        <span>
          © 2026 RV University · School of Computer Science & Engineering
        </span>

        <span>
          CS3301 - Full Stack Development · Campus Connect
        </span>
      </footer>
    </main>
  );
}

function App() {
  useEffect(() => {
    localStorage.removeItem("campusUser");
    localStorage.removeItem("authToken");
    if (!localStorage.getItem("campusAuthUser")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("campusActivePortal");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/student-portal"
          element={
            <RequireAuth portal="student">
              <PortalPage portal="student" />
            </RequireAuth>
          }
        />

        <Route
          path="/faculty-portal"
          element={
            <RequireAuth portal="faculty">
              <PortalPage portal="faculty" />
            </RequireAuth>
          }
        />

        <Route
          path="/administration-portal"
          element={
            <RequireAuth portal="administration">
              <PortalPage portal="administration" />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
