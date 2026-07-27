import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Testimonials from "../components/Testimonials/Testimonials"; // Reuse homepage testimonials
import { useAuth } from "../context/AuthContext";
import { getAllDoctors } from "../services/doctorService";
import { bookAppointment } from "../services/appointmentService";
import { FaCalendarAlt, FaClock, FaStethoscope, FaUserMd, FaHospital, FaCheckCircle, FaExclamationTriangle, FaLock, FaChevronRight, FaCheck, FaShieldAlt, FaSmile, FaRegClock, FaRupeeSign, FaStar, FaHandshake, FaChevronDown } from "react-icons/fa";
import bookingHeroSolidImg from "../assets/booking-hero-solid.png";
import secureLockSolidImg from "../assets/secure-lock-solid.png";
import "./BookAppointment.css";
import "../components/TopDoctors/TopDoctors.css"; // Reuse top doctors layouts

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "02:00 PM", "03:00 PM", "04:00 PM"
];

const FAQS = [
  {
    q: "How can I book an appointment on Medicare+?",
    a: "Booking is simple! Log in to your patient account, go to the Appointment page, choose your preferred specialist, select a date and time slot, and confirm. You will receive an instant scheduling update on your dashboard."
  },
  {
    q: "Can I cancel or reschedule my appointment?",
    a: "Yes, you can check all your active appointments on your Patient Dashboard. Currently, cancellation requests can be managed from the dashboard, or you can contact support for immediate schedule modifications."
  },
  {
    q: "Is there a consultation fee for booking?",
    a: "The consultation fee depends on the selected doctor's experience and specialization. Fee details are displayed directly on the doctor profiles and booking summary card before you confirm."
  },
  {
    q: "How do doctors confirm my scheduling request?",
    a: "Once you submit a request, it appears on the doctor's dashboard as 'Pending'. The doctor will review the appointment and update the status to 'Approved' or 'Declined' based on their availability."
  }
];

const PARTNERS = [
  "Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Manipal Hospitals"
];

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const passedDoctor = location.state?.doctor || null;

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(passedDoctor?._id || "");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
        if (data.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load doctors:", err);
      }
    };
    fetchDoctors();
  }, [selectedDoctorId]);

  const selectedDoctor = passedDoctor || doctors.find(doc => doc._id === selectedDoctorId) || null;

  const handleDoctorChange = (e) => {
    setSelectedDoctorId(e.target.value);
  };

  const handleSlotClick = (slot) => {
    setTimeSlot(slot);
  };

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user || user.role !== "patient") {
      setError("Only patients can book appointments. Please log in as a patient.");
      return;
    }

    if (!selectedDoctorId) {
      setError("Please select a doctor.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (!timeSlot) {
      setError("Please choose a time slot.");
      return;
    }

    setLoading(true);

    try {
      await bookAppointment({
        doctorId: selectedDoctorId,
        appointmentDate: date,
        appointmentTime: timeSlot,
        reason: symptoms,
      });

      setSuccess("Appointment booked successfully! Redirecting to your dashboard...");
      setTimeout(() => {
        navigate("/patient/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const getActiveStep = () => {
    if (!user || user.role !== "patient") return 1;
    if (!selectedDoctorId) return 1;
    if (!date || !timeSlot) return 2;
    return 3;
  };

  const activeStep = getActiveStep();

  return (
    <div className="book-page">

      {/* Hero Section */}
      <section className="book-hero">
        <div className="book-hero-container">
          <motion.div 
            className="book-hero-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>Book An Appointment Online</h1>
            <p>
              Access top clinical specialists, configure your custom schedule, 
              and receive real-time updates from verified healthcare experts.
            </p>
          </motion.div>
          <motion.div 
            className="book-hero-right"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img src={bookingHeroSolidImg} alt="Medicare Hero Illustration" className="hero-illustration" />
          </motion.div>
        </div>
      </section>

      {/* 3-Step Process Indicator */}
      <motion.section 
        className="booking-steps-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="steps-indicator-bar">
          <div className={`step-item ${activeStep >= 1 ? "active" : ""}`}>
            <span className="step-number">{activeStep > 1 ? <FaCheck /> : "1"}</span>
            <span>Choose Doctor</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step-item ${activeStep >= 2 ? "active" : ""}`}>
            <span className="step-number">{activeStep > 2 ? <FaCheck /> : "2"}</span>
            <span>Select Schedule</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step-item ${activeStep >= 3 ? "active" : ""}`}>
            <span className="step-number">{activeStep >= 3 ? <FaCheck /> : "3"}</span>
            <span>Confirm Visit</span>
          </div>
        </div>
      </motion.section>

      {/* Main Content Pane */}
      <section className="book-content-section">
        {!user || user.role !== "patient" ? (
          /* Glassmorphism Lock Card */
          <motion.div 
            className="glass-lock-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="lock-illustration-wrapper">
              <img src={secureLockSolidImg} alt="Authentication Shield" className="lock-illustration" />
            </div>

            <div className="lock-info-content">
              <span className="lock-badge">
                <FaLock style={{ marginRight: "6px" }} /> Authentication Required
              </span>
              <h2>Unlock Scheduling Privileges</h2>
              <p>
                To schedule consultations, check fees, and manage medical histories 
                with Medicare+ clinicians, you must be authenticated as a patient.
              </p>

              <div className="lock-btn-group">
                <Link to="/login" className="primary-btn">
                  Sign In <FaChevronRight style={{ marginLeft: "8px" }} />
                </Link>
                <Link to="/register" className="secondary-btn">
                  Create Account <FaChevronRight style={{ marginLeft: "8px" }} />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Logged In Booking Form & Details */
          <>
            <motion.div 
              className="book-form-card"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2>Confirm Appointment</h2>

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

              <form onSubmit={handleSubmit}>
                {!passedDoctor && (
                  <div className="input-group">
                    <label htmlFor="doctorId">Select Specialist</label>
                    <div className="input-field-wrapper select-wrapper">
                      <select
                        id="doctorId"
                        value={selectedDoctorId}
                        onChange={handleDoctorChange}
                        required
                      >
                        {doctors.map((doc) => (
                          <option key={doc._id} value={doc._id}>
                            {doc.user?.name} - {doc.specialization}
                          </option>
                        ))}
                      </select>
                      <FaUserMd className="input-field-icon" />
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label htmlFor="date">Appointment Date</label>
                  <div className="input-field-wrapper">
                    <input
                      type="date"
                      id="date"
                      value={date}
                      min={getTodayDateString()}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                    <FaCalendarAlt className="input-field-icon" />
                  </div>
                </div>

                <div className="input-group">
                  <label>Available Time Slots</label>
                  <div className="slots-container">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        className={`slot-btn ${timeSlot === slot ? "active" : ""}`}
                        onClick={() => handleSlotClick(slot)}
                      >
                        <FaClock style={{ marginRight: "6px", fontSize: "12px", verticalAlign: "middle" }} />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="symptoms">Symptoms / Reason for Visit</label>
                  <div className="input-field-wrapper">
                    <input
                      type="text"
                      id="symptoms"
                      placeholder="e.g. Fever, persistent headache, checkup"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      required
                    />
                    <FaStethoscope className="input-field-icon" />
                  </div>
                </div>

                <button type="submit" className="login-submit-btn" disabled={loading || success} style={{ height: "50px" }}>
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      <span>Booking Appointment...</span>
                    </>
                  ) : (
                    <span>Confirm Booking</span>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Doctor Info Card */}
            <motion.div 
              className="selected-doctor-summary-card"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {selectedDoctor ? (
                <>
                  <img
                    src={`http://localhost:5000${selectedDoctor.profileImage}`}
                    alt={selectedDoctor.user?.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                    }}
                  />
                  <h3>{selectedDoctor.user?.name}</h3>
                  <span className="spec-tag">{selectedDoctor.specialization}</span>

                  <div className="summary-detail-row">
                    <span>Hospital</span>
                    <span>🏥 {selectedDoctor.hospital}</span>
                  </div>
                  <div className="summary-detail-row">
                    <span>Experience</span>
                    <span>{selectedDoctor.experience} Years</span>
                  </div>
                  <div className="summary-detail-row">
                    <span>Consultation Fee</span>
                    <span>₹{selectedDoctor.consultationFee}</span>
                  </div>
                </>
              ) : (
                <div style={{ color: "var(--text-secondary)" }}>
                  <FaUserMd style={{ fontSize: "48px", marginBottom: "12px" }} />
                  <p>Select a doctor to view their profile summary.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </section>

      {/* Featured Doctors Section (Only shown to Guest users) */}
      {(!user || user.role !== "patient") && (
        <section className="featured-docs-section">
          <h2>Featured Specialists</h2>
          <p>Consult with our highly rated, verified medical professionals.</p>

          <div className="top-doctors-grid">
            {doctors.slice(0, 3).map((doctor) => (
              <motion.div 
                className="top-doctor-card" 
                key={doctor._id} 
                style={{ margin: 0, width: "100%", maxWidth: "340px" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="doctor-img-wrapper">
                  <img
                    src={`http://localhost:5000${doctor.profileImage}`}
                    alt={doctor.user?.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                    }}
                  />
                  <div className="rating-badge">
                    <FaStar /> 4.8
                  </div>
                </div>

                <h3>{doctor.user?.name}</h3>

                <span className="specialization">
                  {doctor.specialization}
                </span>

                <p className="hospital">
                  <FaHospital className="doc-icon" /> {doctor.hospital}
                </p>

                <p className="experience">
                  <FaRegClock className="doc-icon" /> {doctor.experience} Years Experience
                </p>

                <div className="doctor-footer">
                  <span className="fee">
                    <FaRupeeSign className="rupee-icon" /> {doctor.consultationFee}
                  </span>

                  <button className="book-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                    Login to Book
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Hospital Statistics */}
      <section className="book-stats-section">
        <div className="book-stats-grid">
          <div className="book-stat-item">
            <h3>500+</h3>
            <p>Verified Doctors</p>
          </div>
          <div className="book-stat-item">
            <h3>50k+</h3>
            <p>Happy Patients</p>
          </div>
          <div className="book-stat-item">
            <h3>24/7</h3>
            <p>Emergency Services</p>
          </div>
          <div className="book-stat-item">
            <h3>98%</h3>
            <p>Patient Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Partner Logos Showcase */}
      <section className="trust-badges-container" style={{ opacity: 0.8, marginBottom: "80px", flexDirection: "column", textAlign: "center", gap: "20px" }}>
        <h4 style={{ color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase", fontSize: "14px" }}>
          Trusted by Leading Healthcare Partners
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px", fontSize: "18px", fontWeight: "800", color: "#94A3B8" }}>
          {PARTNERS.map((partner) => (
            <span key={partner} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaHandshake style={{ fontSize: "20px", color: "var(--primary)" }} /> {partner}
            </span>
          ))}
        </div>
      </section>

      {/* Patient Testimonials */}
      <Testimonials />

      {/* FAQ Accordion Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common scheduling and booking questions below.</p>

        <div className="faq-accordion-container">
          {FAQS.map((faq, index) => (
            <div key={index} className={`faq-item ${activeFaq === index ? "active" : ""}`}>
              <div className="faq-header" onClick={() => toggleFaq(index)}>
                <span>{faq.q}</span>
                <FaChevronDown className="faq-icon" />
              </div>
              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div 
                    className="faq-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-badges-container">
        <div className="trust-badge-item">
          <FaShieldAlt className="trust-badge-icon" />
          <span>HIPAA Secure Database</span>
        </div>
        <div className="trust-badge-item">
          <FaCheckCircle className="trust-badge-icon" />
          <span>ISO 27001 Certified</span>
        </div>
        <div className="trust-badge-item">
          <FaSmile className="trust-badge-icon" />
          <span>100% Patient Guarantee</span>
        </div>
      </section>

    </div>
  );
};

export default BookAppointment;
