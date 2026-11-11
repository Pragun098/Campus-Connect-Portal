function Hero() {
  return (
    <section className="portal-hero" id="home">
      <div className="hero-content">
        <span className="course-label">
          <span className="course-label-dot" />
          YOUR CAMPUS, ALL IN ONE PLACE
        </span>

        <h1>
          Campus life,
          <br />
          <span>connected.</span>
        </h1>

        <p>
          A better way to keep up with classes, campus activities, and the
          people who make university life happen.
        </p>

        <div className="hero-cta-group">
          <a href="#roles" className="hero-button">
            Access Portals <span aria-hidden="true">→</span>
          </a>
          <a href="#gallery" className="hero-button hero-button-secondary">
            Campus Life & Spaces 📸
          </a>
        </div>

        <div className="hero-note">
          <span className="hero-note-avatars" aria-hidden="true">
            <i>S</i>
            <i>F</i>
            <i>A</i>
          </span>
          <span>One connected community · Students, Faculty & Staff</span>
        </div>
      </div>

      <div className="hero-art" aria-hidden="true">
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />
        <div className="campus-preview">
          <div className="preview-topbar">
            <span className="preview-brand-mark">cc</span>
            <span className="preview-topbar-label">CAMPUS OVERVIEW</span>
            <span className="preview-menu-dots">•••</span>
          </div>

          <div className="preview-welcome">
            <span>MONDAY, 12 AUGUST</span>
            <strong>Make today count.</strong>
          </div>

          <div className="preview-course">
            <span className="preview-course-icon">✳</span>
            <span className="preview-course-copy">
              <small>UP NEXT · 10:30 AM</small>
              <strong>Design &amp; Innovation</strong>
            </span>
            <span className="preview-course-arrow">↗</span>
          </div>

          <div className="preview-bottom">
            <div className="preview-event">
              <span className="preview-event-date">
                <strong>18</strong>
                <small>AUG</small>
              </span>
              <span>
                <small>COMING UP</small>
                <strong>Welcome Week</strong>
              </span>
            </div>
            <div className="preview-activity">
              <span className="activity-bars">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              <strong>You're in good company</strong>
              <small>Campus is buzzing this week</small>
            </div>
          </div>
        </div>

        <div className="hero-float-card">
          <span className="hero-float-icon">✦</span>
          <span>
            <strong>All connected</strong>
            <small>One campus community</small>
          </span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
