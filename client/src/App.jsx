import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Login from "Login";
import Register from "Register";


function Home() {
  return (
    <main className="portal-page">

      <header className="portal-header">

        <a
          className="university-brand"
          href="#home"
          aria-label="RV University home"
        >
          <span className="university-badge">
            RV
          </span>

          <span>
            <strong>
              RV UNIVERSITY<sup>®</sup>
            </strong>

            <small>
              School of Computer Science & Engineering
            </small>
          </span>
        </a>


        <nav aria-label="Main navigation">

          <a href="#about">
            About
          </a>

          <a href="#contact">
            Contact
          </a>

          <Link
            to="/login"
            className="btn-secondary"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="btn-primary"
          >
            Register
          </Link>

        </nav>

      </header>


      <section
        className="portal-hero"
        id="home"
      >
        <div className="hero-content">

          <span className="course-label">
            CS3301 - FULL STACK DEVELOPMENT
          </span>

          {/* Your existing hero content goes here */}

        </div>
      </section>


      <section
        className="roles-section"
        id="roles"
      >

        <p className="section-kicker">
          CAMPUS CONNECT
        </p>

        {/* Your existing roles content goes here */}

      </section>


      <footer id="about">
        <span>
          © 2026 RV University · School of Computer Science & Engineering
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

      </Routes>

    </BrowserRouter>
  );
}


export default App;