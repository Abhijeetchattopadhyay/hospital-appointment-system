import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Hero.css";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBookClick = () => {
    if (user?.role === "patient") {
      navigate("/patient/book-appointment");
    } else {
      navigate("/book-appointment");
    }
  };

  const handleExploreClick = () => {
    navigate("/services");
  };

  return (
    <section className="hero-section">
      {/* Decorative Blur Blobs */}
      <div className="hero-glow-blob blob-left"></div>
      <div className="hero-glow-blob blob-right"></div>

      <div className="hero-container">
        <div className="hero-content">
          {/* Satisfied Patients Avatar Badge */}
          <div className="patients-badge">
            <div className="avatar-stack">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Patient 1" className="stack-avatar" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Patient 2" className="stack-avatar" />
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" alt="Patient 3" className="stack-avatar" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" alt="Patient 4" className="stack-avatar" />
            </div>
            <div className="badge-text">
              <span className="badge-number">260k+</span>
              <span className="badge-label">Satisfy Patient</span>
            </div>
          </div>

          {/* Main Hero Header Title */}
          <h1 className="hero-title">
            Trustworthy Care for You<br />and Your Family
          </h1>

          {/* Subheading description */}
          <p className="hero-description">
            Comprehensive, compassionate healthcare services designed to<br />
            support your family's well-being at every stage of life.
          </p>

          {/* Call-to-actions buttons */}
          <div className="hero-cta-buttons">
            <button className="cta-btn-primary" onClick={handleBookClick}>
              Book Appointment ↗
            </button>
            <button className="cta-btn-secondary" onClick={handleExploreClick}>
              Explore Services ↗
            </button>
          </div>

          {/* Interactive Stacked Cards Deck */}
          <div className="hero-mockup-deck">
            {/* Card 3: Deep decorative layer */}
            <div className="mockup-card mockup-card-3"></div>

            {/* Card 2: Middle layer */}
            <div className="mockup-card mockup-card-2"></div>

            {/* Card 1: Main top active card */}
            <div className="mockup-card mockup-card-1">
              <div className="mockup-card-header">
                <div className="card-header-left">
                  <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px", color: "var(--primary)" }}>
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  </svg>
                  <span className="card-brand">health</span>
                  <span className="card-title-badge">[Internal] Weekly Report Health</span>
                </div>
                <div className="card-header-right">
                  <span className="card-timestamp">20 February 2026 | 11:00 AM</span>
                </div>
              </div>

              <div className="mockup-card-body">
                <div className="meeting-controls">
                  <div className="live-timer">
                    <span className="live-pulse"></span>
                    <span>24:01:45</span>
                  </div>
                  <button className="control-action-btn" onClick={() => navigator.clipboard.writeText("https://healthtrust.com/consult/report-718")}>
                    🔗 Copy to Clipboard
                  </button>
                  <button className="control-action-btn accent-btn">
                    👤 Add Participant
                  </button>
                </div>

                <div className="participants-grid">
                  <div className="participant-card">
                    <div className="avatar-wrapper">
                      <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150" alt="Dr. Sarah Jenkins" className="doctor-avatar" />
                    </div>
                    <div className="participant-text">
                      <span className="name">Dr. Sarah Jenkins</span>
                      <span className="role">Cardiology (Host)</span>
                    </div>
                    <div className="audio-badge active">🎙️</div>
                  </div>

                  <div className="participant-card">
                    <div className="avatar-wrapper">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Test Patient" className="patient-avatar" />
                    </div>
                    <div className="participant-text">
                      <span className="name">You</span>
                      <span className="role">Patient</span>
                    </div>
                    <div className="audio-badge">🎙️</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
