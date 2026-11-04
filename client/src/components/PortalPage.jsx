import { Link } from "react-router-dom";

const portalContent = {
  student: {
    name: "Student Portal",
    audience: "For students",
    description:
      "Keep your academic life organized. Find the information and campus services you need throughout the semester.",
    features: [
      {
        title: "Courses and learning",
        description:
          "Keep track of your courses, learning resources, and important class updates."
      },
      {
        title: "Schedule and attendance",
        description:
          "Review your class schedule and stay informed about attendance activities."
      },
      {
        title: "Campus activities",
        description:
          "Discover workshops, events, and opportunities to get involved on campus."
      }
    ]
  },
  faculty: {
    name: "Faculty Portal",
    audience: "For faculty",
    description:
      "A central starting point for teaching activities, class communication, and student engagement.",
    features: [
      {
        title: "Class management",
        description:
          "Organize course information and keep class activities easy to follow."
      },
      {
        title: "Announcements",
        description:
          "Share timely updates and important information with your students."
      },
      {
        title: "Student engagement",
        description:
          "Stay connected with student activities and support their academic progress."
      }
    ]
  },
  administration: {
    name: "Administration Portal",
    audience: "For administration",
    description:
      "A dedicated starting point for coordinating university services and keeping campus operations connected.",
    features: [
      {
        title: "University services",
        description:
          "Coordinate access to essential services and information across campus."
      },
      {
        title: "Campus activities",
        description:
          "Oversee campus events and keep activity information organized."
      },
      {
        title: "Community updates",
        description:
          "Help students and faculty stay informed about university-wide updates."
      }
    ]
  }
};

function PortalPage({ portal }) {
  const content = portalContent[portal];

  return (
    <main className="portal-page portal-detail">
      <header className="portal-detail-header">
        <Link className="university-brand" to="/">
          <span className="university-badge">RV</span>
          <span>
            <strong>RV UNIVERSITY</strong>
            <small>School of Computer Science &amp; Engineering</small>
          </span>
        </Link>

        <nav aria-label="Portal navigation">
          <Link className="detail-home-link" to="/">
            Home
          </Link>
          <Link className="login-link" to="/login">
            Login
          </Link>
        </nav>
      </header>

      <section className="portal-detail-hero">
        <p className="section-kicker">{content.audience}</p>
        <h1>{content.name}</h1>
        <p>{content.description}</p>
        <Link className="portal-detail-cta" to="/login">
          Sign in to the {content.name}
        </Link>
      </section>

      <section className="portal-detail-content" aria-labelledby="portal-tools">
        <p className="section-kicker">CAMPUS CONNECT</p>
        <h2 id="portal-tools">What you can do here</h2>
        <p className="portal-detail-intro">
          Everything is brought together to support your work and campus
          experience.
        </p>

        <div className="portal-feature-grid">
          {content.features.map((feature) => (
            <article className="portal-feature" key={feature.title}>
              <span className="portal-feature-mark" aria-hidden="true">
                ✓
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>

        <div className="portal-detail-footer">
          <p>Ready to continue?</p>
          <Link className="register-link" to="/login">
            Go to login
          </Link>
        </div>
      </section>
    </main>
  );
}

export default PortalPage;
