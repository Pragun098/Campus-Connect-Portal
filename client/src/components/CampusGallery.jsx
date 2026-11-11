import { useState, useRef, useEffect } from "react";

const campusImages = [
  {
    id: 1,
    title: "Central Digital Library",
    category: "Academics",
    badge: "RESEARCH HUB",
    description: "Multi-level library with quiet study spaces, research pods, and 150,000+ digital journals.",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
    aspect: "16/10"
  },
  {
    id: 2,
    title: "Advanced AI & Software Labs",
    category: "Tech",
    badge: "CS & ENGINEERING",
    description: "High-performance GPU computing clusters powering hands-on full stack and machine learning projects.",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
    aspect: "16/10"
  },
  {
    id: 3,
    title: "Lush Green Central Quad",
    category: "Campus",
    badge: "ECO CAMPUS",
    description: "Landscaped outdoor spaces and amphitheater for collaborative learning, relaxation, and student discussions.",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80",
    aspect: "16/10"
  },
  {
    id: 4,
    title: "Robotics & IoT Innovation Hub",
    category: "Tech",
    badge: "MAKERSPACE",
    description: "State-of-the-art laboratory where students engineer autonomous systems, microelectronics, and drones.",
    url: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1000&q=80",
    aspect: "16/10"
  },
  {
    id: 5,
    title: "Interactive Lecture Theatres",
    category: "Academics",
    badge: "SMART CLASSROOM",
    description: "Modern amphitheaters with multi-screen projection for interactive lectures and guest masterclasses.",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80",
    aspect: "16/10"
  },
  {
    id: 6,
    title: "Athletics & Sports Complex",
    category: "Sports",
    badge: "SPORTS ARENA",
    description: "Floodlit sporting arena, athletic tracks, indoor badminton courts, and fitness center.",
    url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80",
    aspect: "16/10"
  },
  {
    id: 7,
    title: "Hackathons & Cultural Festivals",
    category: "Events",
    badge: "STUDENT LIFE",
    description: "48-hour competitive hackathons, innovation showcases, robotics leagues, and campus festivals.",
    url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80",
    aspect: "16/10"
  },
  {
    id: 8,
    title: "Convocation & Graduation Day",
    category: "Events",
    badge: "ALUMNI & FUTURE",
    description: "Celebrating milestone academic achievements as graduates transition into global industry careers.",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
    aspect: "16/10"
  }
];

const categories = ["All", "Academics", "Tech", "Campus", "Sports", "Events"];

function CampusGallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isPaused, setIsPaused] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const scrollContainerRef = useRef(null);

  const filteredImages = selectedCategory === "All"
    ? campusImages
    : campusImages.filter((img) => img.category === selectedCategory);

  // Repeat items to allow smooth continuous scrolling
  const displayItems = [...filteredImages, ...filteredImages];

  // Manual scroll buttons
  const scrollByAmount = (offset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: offset,
        behavior: "smooth"
      });
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setActiveImage(null);
      }
    }
    if (activeImage) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [activeImage]);

  return (
    <section className="campus-gallery-section" id="gallery" aria-label="Campus Life Gallery">
      <div className="gallery-header">
        <div>
          <span className="section-kicker">CAMPUS IN MOTION</span>
          <h2 className="gallery-title">Life & Spaces at RV University</h2>
          <p className="section-intro">
            Explore our cutting-edge labs, modern collaborative commons, vibrant student culture, and green campus spaces.
          </p>
        </div>

        {/* Gallery Controls */}
        <div className="gallery-controls">
          <button
            type="button"
            className="gallery-ctrl-btn"
            onClick={() => scrollByAmount(-340)}
            title="Scroll Left"
            aria-label="Scroll Left"
          >
            ←
          </button>
          <button
            type="button"
            className={`gallery-ctrl-btn gallery-pause-btn ${isPaused ? "active" : ""}`}
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume Auto-Scroll" : "Pause Auto-Scroll"}
            aria-label={isPaused ? "Resume Auto-Scroll" : "Pause Auto-Scroll"}
          >
            {isPaused ? "▶ Play" : "⏸ Pause"}
          </button>
          <button
            type="button"
            className="gallery-ctrl-btn"
            onClick={() => scrollByAmount(340)}
            title="Scroll Right"
            aria-label="Scroll Right"
          >
            →
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="gallery-category-tabs" role="tablist" aria-label="Filter campus gallery">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`gallery-tab-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scrolling Track */}
      <div
        className={`gallery-track-viewport ${isPaused ? "paused" : ""}`}
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`gallery-marquee-track ${isPaused ? "is-paused" : ""}`}>
          {displayItems.map((item, index) => (
            <article
              key={`${item.id}-${index}`}
              className="gallery-card"
              onClick={() => setActiveImage(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveImage(item);
                }
              }}
            >
              <div className="gallery-image-wrapper">
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  className="gallery-card-img"
                />
                <span className="gallery-card-badge">{item.badge}</span>
                <div className="gallery-hover-overlay">
                  <span className="gallery-zoom-icon">🔍 View Photo</span>
                </div>
              </div>
              <div className="gallery-card-meta">
                <span className="gallery-card-category">{item.category}</span>
                <h3 className="gallery-card-title">{item.title}</h3>
                <p className="gallery-card-desc">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="campus-stats-strip">
        <div className="stat-item">
          <strong>100+</strong>
          <span>Acre Green Campus</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <strong>45+</strong>
          <span>High-Tech Labs & Hubs</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <strong>150k+</strong>
          <span>Library Digital Volumes</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <strong>50+</strong>
          <span>Active Clubs & Teams</span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.title}
          onClick={() => setActiveImage(null)}
        >
          <div
            className="lightbox-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setActiveImage(null)}
              aria-label="Close dialog"
            >
              ✕
            </button>
            <div className="lightbox-img-box">
              <img
                src={activeImage.url}
                alt={activeImage.title}
                className="lightbox-image"
              />
              <span className="gallery-card-badge lightbox-badge">{activeImage.badge}</span>
            </div>
            <div className="lightbox-details">
              <span className="gallery-card-category">{activeImage.category}</span>
              <h3>{activeImage.title}</h3>
              <p>{activeImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CampusGallery;
