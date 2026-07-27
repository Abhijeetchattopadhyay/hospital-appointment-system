import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import { FaEnvelope, FaArrowLeft, FaExclamationTriangle, FaCheckCircle, FaLock } from "react-icons/fa";
import "./Register.css"; // Reuse premium layout styles
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await forgotPassword({ email });
      setSuccess(data.message || "A password reset link has been sent to your email!");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Failed to request password reset. Please verify your email and try again."
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
        <div className="stat-icon-glow lock">🔑</div>
        <div>
          <h5>Self Recovery</h5>
          <p>Instant password reset</p>
        </div>
      </div>

      <div className="register-content-wrapper" style={{ maxWidth: "480px" }}>
        <div className="register-form-card">
          <div className="register-header-group">
            <h3>Forgot Password</h3>
            <p className="register-form-subtitle">Enter your registered email address to receive a secure password reset link.</p>
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
                <label htmlFor="email">Email Address</label>
                <div className="input-field-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FaEnvelope className="input-field-icon" />
                </div>
              </div>

              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Request Reset Link</span>
                )}
              </button>
            </form>
          )}

          {success && (
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", marginBottom: "20px" }}>
                Didn't receive the email? Check your spam folder or try requesting the link again.
              </p>
              <button 
                type="button" 
                className="register-submit-btn" 
                style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--primary)", border: "1px solid rgba(37, 99, 235, 0.2)", cursor: "pointer" }}
                onClick={() => setSuccess("")}
              >
                Request Another Link
              </button>
            </div>
          )}

          <p className="register-redirect-link">
            Remembered your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
