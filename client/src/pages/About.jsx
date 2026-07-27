import { FaBriefcaseMedical, FaProcedures, FaVials, FaPills } from "react-icons/fa";
import "./About.css";

const About = () => {
  return (
    <div className="about-page">

      <section className="about-hero">
        <h1>About MediCare+</h1>
        <p>
          We are dedicated to providing state-of-the-art medical services with compassion, 
          excellence, and trust. Discover our legacy of healthcare leadership.
        </p>
      </section>

      <section className="about-content-section">
        {/* Intro Mission/Vision */}
        <div className="about-intro-grid">
          <div className="about-intro-card">
            <h2>Our Mission</h2>
            <p>
              To improve the health and well-being of the communities we serve by 
              delivering exceptional, accessible, and high-quality clinical care with 
              unwavering integrity and respect.
            </p>
            <p>
              We integrate medical research, advanced technology, and professional expertise 
              to provide personalized treatment pathways for every patient.
            </p>
          </div>

          <div className="about-intro-card">
            <h2>Our Vision</h2>
            <p>
              To be the premier digital healthcare provider and clinical partner of choice, 
              recognized for exceptional medical outcomes, advanced technological solutions, 
              and patient-first experiences.
            </p>
            <p>
              We strive to empower individuals in managing their medical care dynamically and 
              efficiently using state-of-the-art MERN technology.
            </p>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="facilities-header">
          <h2>Hospital Facilities</h2>
          <p className="facilities-subtitle">
            Equipped with modern facilities to provide top-notch care 24/7.
          </p>
        </div>

        <div className="facilities-grid">
          <div className="facility-card">
            <div className="facility-icon-wrapper">
              <FaBriefcaseMedical />
            </div>
            <h3>Emergency Care</h3>
            <p>Ready to respond immediately to critical situations with specialist standby.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon-wrapper">
              <FaProcedures />
            </div>
            <h3>Modern ICU</h3>
            <p>Fully equipped intensive care units with individual patient monitoring systems.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon-wrapper">
              <FaVials />
            </div>
            <h3>Advanced Lab</h3>
            <p>Comprehensive pathology services providing automated and precise diagnostics.</p>
          </div>

          <div className="facility-card">
            <div className="facility-icon-wrapper">
              <FaPills />
            </div>
            <h3>24/7 Pharmacy</h3>
            <p>In-house pharmacy stocked with essential drugs and qualified pharmacists.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
