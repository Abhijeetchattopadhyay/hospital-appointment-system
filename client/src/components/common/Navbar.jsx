import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBars, FaTimes, FaRegUser, 
  FaSignOutAlt, FaColumns, FaUserCircle 
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === "/";

  // Scroll listener to toggle sticky style adjustments
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (user?.role === "patient") return "/patient/dashboard";
    if (user?.role === "doctor") return "/doctor/dashboard";
    if (user?.role === "admin") return "/admin/dashboard";
    return "/login";
  };

  const getDropdownAvatar = (user) => {
    let initials = "P";
    if (user?.name) {
      const parts = user.name.trim().split(" ");
      if (parts.length === 1) {
        initials = parts[0].charAt(0).toUpperCase();
      } else {
        initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
      }
    } else {
      initials = user?.email?.charAt(0).toUpperCase() || "P";
    }

    const gradients = [
      "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
      "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
      "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
    ];
    const colorIndex = (user?.name?.length || user?.email?.length || 0) % gradients.length;
    const background = gradients[colorIndex];

    return (
      <div className="dropdown-user-avatar" style={{ background }}>
        {initials}
      </div>
    );
  };

  const getBookAppointmentPath = () => {
    if (user?.role === "patient") return "/patient/book-appointment";
    return "/book-appointment";
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""} ${isHomePage ? "navbar-on-home" : ""}`}>
        {/* Left Side: Custom Heart-Stethoscope SVG Logo & lowercase health branding */}
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "28px", height: "28px", color: "var(--primary)" }}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          </svg>
          <span>health</span>
        </Link>

        {/* Center: Navigation Links for Desktop */}
        {(!user || user.role === "patient") && (
          <div className="nav-links-center">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Home
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              About
            </NavLink>
            <NavLink to="/services" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Services
            </NavLink>
            <NavLink to="/doctors" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Doctors
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              FAQs
            </NavLink>
          </div>
        )}

        {/* Right Side: CTAs & Actions */}
        <div className="nav-actions">
          {user ? (
            <>
              {/* Profile Dropdown (Logged In) */}
              <div className="profile-menu-container">
                <button 
                  className="profile-icon-btn" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                  aria-label="Profile Menu"
                >
                  <FaRegUser />
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      className="profile-dropdown"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="dropdown-user-info">
                        {getDropdownAvatar(user)}
                        <div className="dropdown-user-details">
                          <span className="user-name">{user.name || "Portal User"}</span>
                          <span className="user-email">{user.email}</span>
                          <span className={`user-role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <Link to={getDashboardPath()} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FaColumns /> Dashboard
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item logout-btn-item">
                        <FaSignOutAlt /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              {/* Guest Actions (Logged Out) */}
              <Link to="/login" className="nav-login-btn">Login</Link>
              <Link to="/register" className="nav-register-btn">Register</Link>
            </>
          )}

          {/* Prominent Contact Us Pill Button */}
          {(!user || user.role === "patient") && (
            <Link to="/contact" className="nav-contact-btn">
              Contact Us ↗
            </Link>
          )}

          {/* Mobile Menu Toggle Icon */}
          <button 
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer Slider */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in Drawer */}
            <motion.div 
              className="drawer-container"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="drawer-header">
                <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "28px", height: "28px", color: "var(--primary)" }}>
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  </svg>
                  <span>health</span>
                </Link>
                <button 
                  className="drawer-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close Menu"
                >
                  <FaTimes />
                </button>
              </div>

              {(!user || user.role === "patient") && (
                <div className="drawer-links">
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => isActive ? "drawer-link active" : "drawer-link"}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </NavLink>
                  <NavLink 
                    to="/about" 
                    className={({ isActive }) => isActive ? "drawer-link active" : "drawer-link"}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </NavLink>
                  <NavLink 
                    to="/services" 
                    className={({ isActive }) => isActive ? "drawer-link active" : "drawer-link"}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Services
                  </NavLink>
                  <NavLink 
                    to="/doctors" 
                    className={({ isActive }) => isActive ? "drawer-link active" : "drawer-link"}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Doctors
                  </NavLink>
                  <NavLink 
                    to="/contact" 
                    className={({ isActive }) => isActive ? "drawer-link active" : "drawer-link"}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    FAQs
                  </NavLink>
                </div>
              )}

              <div className="drawer-actions">
                {user ? (
                  <>
                    <div className="drawer-user-info-card">
                      <FaUserCircle className="drawer-avatar" />
                      <div className="drawer-user-meta">
                        <span className="drawer-email">{user.email}</span>
                        <span className="drawer-role">{user.role}</span>
                      </div>
                    </div>
                    <Link 
                      to={getDashboardPath()} 
                      className="drawer-action-btn border-btn"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FaColumns /> Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="drawer-action-btn logout-btn"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="drawer-action-btn border-btn"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="drawer-action-btn solid-btn"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}

                {(!user || user.role === "patient") && (
                  <Link 
                    to={getBookAppointmentPath()} 
                    className="drawer-book-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Book Appointment
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;