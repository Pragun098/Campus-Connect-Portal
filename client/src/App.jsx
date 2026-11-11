import "./App.css";

import {
  BrowserRouter,
  Navigate,
  Routes,
  Route
} from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./login.jsx";
import Register from "./register.jsx";

import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import PortalCard from "./components/PortalCard.jsx";
import PortalPage from "./components/PortalPage.jsx";

function RequireAuth({ children, portal }) {
  const [status, setStatus] = useState(
    localStorage.getItem("campusAuthUser") ? "checking" : "unauthenticated"
  );
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("campusAuthUser")) {
      return;
    }

    fetch("/api/auth/me")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("campusAuthUser");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("campusActivePortal");
            setStatus("unauthenticated");
          } else {
            setStatus("error");
          }
          return;
        }

        localStorage.setItem("campusAuthUser", JSON.stringify(result.user));
        localStorage.setItem("campusActivePortal", result.user.portal);
        setUser(result.user);
        setStatus("authorized");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "checking") {
    return <main className="auth-page"><p>Checking your account...</p></main>;
  }

  if (status === "error") {
    return (
      <main className="auth-page">
        <p role="alert">Unable to verify your sign-in. Check your connection and reload.</p>
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

  if (portal && user.portal !== portal) {
    return <Navigate to={`/${user.portal}-portal`} replace />;
  }

  return children;
}

function Home() {

  return (
    <main className="portal-page">

      <Header />

      <Hero />

      <section
        className="roles-section"
        id="roles"
      >

        <p className="section-kicker">
          CAMPUS CONNECT
        </p>

        <h2>
          Campus Life & Portal Highlights
        </h2>

        <p className="section-intro">
          Access important university services through
          one simple digital platform.
        </p>

        <div className="role-grid">

          <PortalCard
            title="Student Portal"
            description="Access courses, schedules and academic information."
            icon="S"
            className=""
            to="/student-portal"
          />

          <PortalCard
            title="Faculty Portal"
            description="Manage classes, announcements and student activities."
            icon="F"
            className="faculty-icon"
            to="/faculty-portal"
          />

          <PortalCard
            title="Administration Portal"
            description="Manage university services and campus activities."
            icon="A"
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
          CS3301 - Full Stack Development
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

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

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