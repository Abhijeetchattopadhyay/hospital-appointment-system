import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaExclamationTriangle, FaUserCheck, FaUserMd, FaShieldAlt } from "react-icons/fa";
import { validateEmail } from "../utils/validation";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    specialization: "General Physician",
    qualification: "",
    experience: "",
    consultationFee: "",
    hospital: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [degreeFile, setDegreeFile] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Name Validation
    const trimmedName = formData.name.trim();
    if (trimmedName.length < 3) {
      setError("Full Name must be at least 3 characters long.");
      return;
    }
    const nameRegex = /^[a-zA-Z\s.]+$/;
    if (!nameRegex.test(trimmedName)) {
      setError("Full Name can only contain letters, spaces, and dots.");
      return;
    }

    // Email Validation
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address without typos.");
      return;
    }

    // Password Validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Doctor Credentials Validation
    if (formData.role === "doctor") {
      const { specialization, qualification, experience, consultationFee, hospital, address } = formData;
      if (!specialization || !qualification || !experience || !consultationFee || !hospital || !address) {
        setError("All professional details are required for doctor registration.");
        return;
      }
      if (Number(experience) <= 0 || isNaN(Number(experience))) {
        setError("Clinical experience must be a positive number.");
        return;
      }
      if (Number(consultationFee) <= 0 || isNaN(Number(consultationFee))) {
        setError("Consultation fee must be a positive number.");
        return;
      }
      if (!degreeFile) {
        setError("Please upload your degree file for verification.");
        return;
      }
    }

    setLoading(true);

    try {
      let submitData;
      if (formData.role === "doctor") {
        submitData = new FormData();
        submitData.append("name", formData.name.trim());
        submitData.append("email", formData.email.trim().toLowerCase());
        submitData.append("password", formData.password);
        submitData.append("role", formData.role);
        submitData.append("specialization", formData.specialization);
        submitData.append("qualification", formData.qualification);
        submitData.append("experience", formData.experience);
        submitData.append("consultationFee", formData.consultationFee);
        submitData.append("hospital", formData.hospital);
        submitData.append("address", formData.address);
        submitData.append("degree", degreeFile);
      } else {
        submitData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role
        };
      }

      await register(submitData);
      setSuccess("Account created successfully! Redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError("Cannot connect to the server. Please make sure the server is running and try again.");
      } else {
        setError(err.response?.data?.message || "Failed to create account. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Left Column (Branding & Trust points) */}
      <div className="register-left-pane">
        <div className="register-brand">
          🏥 MediCare+
        </div>
        
        <div className="register-left-content">
          <h2>Your Trusted Partner in Digital Health</h2>
          <p>
            Connect with certified doctors, manage appointments, and access your 
            medical records seamlessly from anywhere.
          </p>

          <div className="register-features-list">
            <div className="register-feature-item">
              <span className="register-feature-icon">
                <FaUserCheck />
              </span>
              <span>Access Your Patient Dashboard & Health History</span>
            </div>
            <div className="register-feature-item">
              <span className="register-feature-icon">
                <FaUserMd />
              </span>
              <span>Interact Directly with Verified Specialists</span>
            </div>
            <div className="register-feature-item">
              <span className="register-feature-icon">
                <FaShieldAlt />
              </span>
              <span>Secure Clinical Operations & Verification</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Form card) */}
      <div className="register-right-pane">
        <div className="register-form-card">
          <Link to="/" className="back-home-btn">
            <FaArrowLeft /> Back to Home
          </Link>

          <div className="register-header-group">
            <h3>Create Account</h3>
            <p className="register-form-subtitle">Join Medicare+ healthcare portal</p>
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <FaUserCheck style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-field-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <FaUser className="input-field-icon" />
              </div>
            </div>

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
              <label htmlFor="password">Password</label>
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
              <label>Account Type</label>
              <div className="role-cards-container" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div 
                  className={`role-card ${formData.role === "patient" ? "active" : ""}`}
                  onClick={() => setFormData({ ...formData, role: "patient" })}
                >
                  <FaUser className="role-card-icon" />
                  <div className="role-card-text">
                    <h4>Patient</h4>
                    <p>Book visits</p>
                  </div>
                </div>
                <div 
                  className={`role-card ${formData.role === "doctor" ? "active" : ""}`}
                  onClick={() => setFormData({ ...formData, role: "doctor" })}
                >
                  <FaUserMd className="role-card-icon" />
                  <div className="role-card-text">
                    <h4>Doctor</h4>
                    <p>Consultations</p>
                  </div>
                </div>
              </div>
            </div>

            {formData.role === "doctor" && (
              <div className="doctor-credentials-register-section" style={{
                marginTop: "20px",
                padding: "20px",
                background: "rgba(37, 99, 235, 0.03)",
                border: "1.5px solid rgba(37, 99, 235, 0.1)",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "750", color: "var(--dark-navy)" }}>Professional Medical Info</h4>
                
                <div className="input-group" style={{ margin: 0 }}>
                  <label htmlFor="specialization">Specialization</label>
                  <div className="input-field-wrapper">
                    <select
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Dental Care">Dental Care</option>
                    </select>
                    <FaUserMd className="input-field-icon" />
                  </div>
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label htmlFor="qualification">Professional Qualification</label>
                  <div className="input-field-wrapper">
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      placeholder="e.g. MBBS, MD (Medicine)"
                      value={formData.qualification}
                      onChange={handleChange}
                      required
                    />
                    <FaUserMd className="input-field-icon" />
                  </div>
                </div>

                <div className="register-grid-inputs-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label htmlFor="experience">Experience (Years)</label>
                    <div className="input-field-wrapper">
                      <input
                        type="number"
                        id="experience"
                        name="experience"
                        placeholder="e.g. 5"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                      />
                      <FaUserMd className="input-field-icon" />
                    </div>
                  </div>

                  <div className="input-group" style={{ margin: 0 }}>
                    <label htmlFor="consultationFee">Fee (INR)</label>
                    <div className="input-field-wrapper">
                      <input
                        type="number"
                        id="consultationFee"
                        name="consultationFee"
                        placeholder="e.g. 500"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        required
                      />
                      <FaUserMd className="input-field-icon" />
                    </div>
                  </div>
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label htmlFor="hospital">Hospital Affiliation</label>
                  <div className="input-field-wrapper">
                    <input
                      type="text"
                      id="hospital"
                      name="hospital"
                      placeholder="e.g. Apollo Hospital"
                      value={formData.hospital}
                      onChange={handleChange}
                      required
                    />
                    <FaUserMd className="input-field-icon" />
                  </div>
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label htmlFor="address">Clinic Address</label>
                  <div className="input-field-wrapper">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="123 Health Ave, Suite A"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                    <FaUserMd className="input-field-icon" />
                  </div>
                </div>

                <div className="input-group" style={{ margin: "6px 0 0 0" }}>
                  <label>Degree Document (PDF or Image)</label>
                  <div className="file-upload-wrapper">
                    <label htmlFor="degree" className="file-upload-label">
                      📁 Choose Degree File
                    </label>
                    <input
                      type="file"
                      id="degree"
                      name="degree"
                      className="file-upload-input"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => setDegreeFile(e.target.files[0])}
                      required
                    />
                    {degreeFile && (
                      <span className="file-upload-filename">
                        Selected: {degreeFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="register-submit-btn" disabled={loading || success}>
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          <p className="register-redirect-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;