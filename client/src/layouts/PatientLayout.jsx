import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, CalendarRange, User, FileSpreadsheet, Settings, 
  LogOut, CalendarPlus 
} from "lucide-react";
import "../pages/patient/PatientDashboard.css"; // Reuse dashboard styling

const HealthTrustLogoIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="sidebar-logo-icon"
  >
    {/* Handle */}
    <path
      d="M9 7V5.5C9 4.67157 9.67157 4 10.5 4H13.5C14.3284 4 15 4.67157 15 5.5V7"
      stroke="#06B6D4"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Briefcase Body */}
    <rect
      x="4"
      y="7"
      width="16"
      height="13"
      rx="3"
      fill="#06B6D4"
    />
    {/* Medical Cross (White) */}
    <path
      d="M12 10V17"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M8.5 13.5H15.5"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const PatientLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActiveTab = (tabName) => {
    // If we're on the dashboard path and checking query param tab
    if (tabName === "dashboard") {
      return location.pathname === "/patient/dashboard" && !location.search.includes("tab=");
    }
    if (tabName === "book") {
      return location.pathname === "/patient/book-appointment";
    }
    return location.pathname === "/patient/dashboard" && location.search.includes(`tab=${tabName}`);
  };

  return (
    <div className="dashboard-container">
      {/* 1. Left Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div>
          <Link to="/" className="sidebar-logo">
            <HealthTrustLogoIcon />
            <span>Health<span>Trust</span></span>
          </Link>
          <nav className="sidebar-menu">
            <Link 
              to="/patient/dashboard" 
              className={`sidebar-link ${isActiveTab("dashboard") ? "active" : ""}`}
            >
              <LayoutDashboard style={{ width: "20px", height: "20px" }} />
              <span>Dashboard</span>
            </Link>

            <Link 
              to="/patient/book-appointment" 
              className={`sidebar-link ${isActiveTab("book") ? "active" : ""}`}
            >
              <CalendarPlus style={{ width: "20px", height: "20px" }} />
              <span>Book Appointment</span>
            </Link>

            <Link 
              to="/patient/dashboard?tab=appointments" 
              className={`sidebar-link ${isActiveTab("appointments") ? "active" : ""}`}
            >
              <CalendarRange style={{ width: "20px", height: "20px" }} />
              <span>My Appointments</span>
            </Link>

            <Link 
              to="/patient/dashboard?tab=profile" 
              className={`sidebar-link ${isActiveTab("profile") ? "active" : ""}`}
            >
              <User style={{ width: "20px", height: "20px" }} />
              <span>Profile Details</span>
            </Link>

            <Link 
              to="/patient/dashboard?tab=records" 
              className={`sidebar-link ${isActiveTab("records") ? "active" : ""}`}
            >
              <FileSpreadsheet style={{ width: "20px", height: "20px" }} />
              <span>Medical Records</span>
            </Link>

          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout} style={{ color: "#FCA5A5" }}>
            <LogOut style={{ width: "20px", height: "20px" }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Right Outlet Workspace */}
      <Outlet />
    </div>
  );
};

export default PatientLayout;
