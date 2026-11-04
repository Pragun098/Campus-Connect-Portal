import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./login.jsx";
import Register from "./register.jsx";

import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import PortalCard from "./components/PortalCard.jsx";
import ActivityTracker from "./components/ActivityTracker.jsx";
import PortalPage from "./components/PortalPage.jsx";


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


      <ActivityTracker />


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
          element={<PortalPage portal="student" />}
        />

        <Route
          path="/faculty-portal"
          element={<PortalPage portal="faculty" />}
        />

        <Route
          path="/administration-portal"
          element={<PortalPage portal="administration" />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;