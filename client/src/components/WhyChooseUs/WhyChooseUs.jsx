import { FaHeadset, FaAward, FaLaptopMedical } from "react-icons/fa";
import whyChooseImg from "../../assets/healthtrust_why_choose.png";
import "./WhyChooseUs.css";

const WhyChooseUs = () => {
  return (
    <section className="why-choose-section">
      <div className="why-choose-container">
        <div className="why-choose-left">
          <h2 className="why-choose-title">Why Choose HealthTrust?</h2>
          <p className="why-choose-desc">
            We combine clinical excellence with a compassionate touch, ensuring every patient receives personalized care that meets the highest standards.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FaHeadset />
              </div>
              <div className="feature-text">
                <h3>24/7 Support</h3>
                <p>Our dedicated teams are available around the clock for your peace of mind.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FaAward />
              </div>
              <div className="feature-text">
                <h3>Certified Specialists</h3>
                <p>All our practitioners are board-certified with years of clinical expertise.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FaLaptopMedical />
              </div>
              <div className="feature-text">
                <h3>Modern Technology</h3>
                <p>Utilizing the latest medical equipment for accurate diagnosis and treatment.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="why-choose-right">
          <div className="why-choose-image-container">
            <img src={whyChooseImg} alt="Modern HealthTrust Clinic Exterior" className="why-choose-img" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
