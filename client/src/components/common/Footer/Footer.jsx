import { Link } from "react-router-dom";
import { FaGlobe, FaCommentAlt, FaEnvelope } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-healthtrust">
      <div className="footer-container">
        <div className="footer-left">
          <h2 className="footer-logo">Health<span>Trust</span></h2>
          <p className="footer-copy">
            © 2024 HealthTrust Medical Group. Committed to Accessible Healthcare.
          </p>
          <div className="footer-social-icons">
            <a href="/" aria-label="Website"><FaGlobe /></a>
            <a href="/contact" aria-label="Chat"><FaCommentAlt /></a>
            <a href="mailto:info@healthtrust.com" aria-label="Email"><FaEnvelope /></a>
          </div>
        </div>

        <div className="footer-right">
          <h3>RESOURCES</h3>
          <ul className="footer-links-list">
            <li>
              <Link to="/contact">Emergency Care</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
