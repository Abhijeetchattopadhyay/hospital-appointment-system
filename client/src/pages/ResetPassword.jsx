import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { FaLock, FaArrowLeft, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import "./Register.css"; // Reuse premium layout styles
import "./ForgotPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(token, { password: formData.password });
      setSuccess(data.message || "Password updated successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Failed to reset password. The link may have expired or is invalid."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Floating Back Link */}
      <Link to="/login" className="floating-back-btn" title="Back to Login">
        <FaArrowLeft style={{ marginRight: "6px" }} /> Back to Sign In
      </Link>

      {/* Floating Decorative Elements */}
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>

      <div className="floating-stat-card stat-top-left" style={{ top: "25%", left: "15%" }}>
        <div className="stat-icon-glow lock">🔒</div>
        <div>
          <h5>Security Verification</h5>
          <p>Hashed & secure update</p>
        </div>
      </div>

      <div className="register-content-wrapper" style={{ maxWidth: "480px" }}>
        <div className="register-form-card">
          <div className="register-header-group">
            <h3>Reset Password</h3>
            <p className="register-form-subtitle">Choose a new, secure password for your account.</p>
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <FaCheckCircle style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="password">New Password</label>
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

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-field-wrapper">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <FaLock className="input-field-icon" />
                </div>
              </div>

              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          )}

          <p className="register-redirect-link">
            Remembered your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
