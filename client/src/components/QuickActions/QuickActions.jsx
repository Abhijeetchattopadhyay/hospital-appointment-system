import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaPlus, FaStarOfLife, FaArrowRight } from "react-icons/fa";
import "./QuickActions.css";

const QuickActions = () => {
  const { user } = useAuth();

  const getBookAppointmentPath = () => {
    if (user?.role === "patient") {
      return "/patient/book-appointment";
    }
    return "/book-appointment";
  };

  const getPortalPath = () => {
    if (user?.role === "patient") {
      return "/patient/dashboard";
    }
    if (user?.role === "doctor") {
      return "/doctor/dashboard";
    }
    if (user?.role === "admin") {
      return "/admin/dashboard";
    }
    return "/login";
  };

  return (
    <section className="quick-actions-section">
      <div className="quick-actions-grid">
        {/* Card 1: Book Appointment */}
        <div className="action-card">
          <div className="action-icon-wrapper plus-icon">
            <FaPlus />
          </div>
          <h3>Book Appointment</h3>
          <p>Schedule your visit with any of our providers instantly.</p>
          <Link to={getBookAppointmentPath()} className="action-link">
            Schedule Online <FaArrowRight className="link-arrow" />
          </Link>
        </div>

        {/* Card 2: Find a Doctor */}
        <div className="action-card">
          <div className="action-icon-wrapper plus-icon">
            <FaPlus />
          </div>
          <h3>Find a Doctor</h3>
          <p>Browse our directory of experts and medical specialists.</p>
          <Link to="/doctors" className="action-link">
            Search Directory <FaArrowRight className="link-arrow" />
          </Link>
        </div>

        {/* Card 3: Emergency Care */}
        <div className="action-card emergency-card">
          <div className="action-icon-wrapper emergency-icon">
            <FaStarOfLife />
          </div>
          <h3>Emergency Care</h3>
          <p>Get immediate medical attention at our 24/7 trauma centers.</p>
          <Link to="/contact" className="action-link white-link">
            Emergency Map <FaArrowRight className="link-arrow" />
          </Link>
        </div>

        {/* Card 4: Patient Portal */}
        <div className="action-card">
          <div className="action-icon-wrapper plus-icon">
            <FaPlus />
          </div>
          <h3>Patient Portal</h3>
          <p>Access your records, test results, and bill payments.</p>
          <Link to={getPortalPath()} className="action-link">
            Login Now <FaArrowRight className="link-arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default QuickActions;