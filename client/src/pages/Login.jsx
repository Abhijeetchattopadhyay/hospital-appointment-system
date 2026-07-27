import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaArrowLeft, FaExclamationTriangle, FaUserCheck, FaUserMd, FaHospital } from "react-icons/fa";
import { validateEmail } from "../utils/validation";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Email validation
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address without typos.");
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      // Successfully authenticated. Redirect user based on their role
      if (response && response.user) {
        const userRole = response.user.role;
        if (userRole === "patient") {
          navigate("/patient/dashboard");
        } else if (userRole === "doctor") {
          navigate("/doctor/dashboard");
        } else if (userRole === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/"); // Default backup redirection
        }
      } else {
        setError("Invalid response received from the login server.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Failed to log in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Left Column (Branding & Trust points) */}
      <div className="login-left-pane">
        <div className="login-brand">
          🏥 MediCare+
        </div>
        
        <div className="login-left-content">
          <h2>Your Trusted Partner in Digital Health</h2>
          <p>
            Connect with certified doctors, manage appointments, and access your 
            medical records seamlessly from anywhere.
          </p>

          <div className="login-features-list">
            <div className="login-feature-item">
              <span className="login-feature-icon">
                <FaUserCheck />
              </span>
              <span>Access Your Patient Dashboard & Health History</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">
                <FaUserMd />
              </span>
              <span>Interact Directly with Verified Specialists</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">
                <FaHospital />
              </span>
              <span>Integrated Hospital Management & Billing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Form card) */}
      <div className="login-right-pane">
        <div className="login-form-card">
          <Link to="/" className="back-home-btn">
            <FaArrowLeft /> Back to Home
          </Link>

          <h3>Welcome Back</h3>
          <p className="login-form-subtitle">Please enter your credentials to log in.</p>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-field-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <FaEnvelope className="input-field-icon" />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "2px" }}>
                <label htmlFor="password" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: "13px", color: "var(--primary)", fontWeight: 650, textDecoration: "none" }}>Forgot Password?</Link>
              </div>
              <div className="input-field-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <FaLock className="input-field-icon" />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <p className="login-redirect-link">
            Don't have an account yet? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;