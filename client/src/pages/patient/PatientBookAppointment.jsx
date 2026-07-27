import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllDoctors } from "../../services/doctorService";
import { bookAppointment } from "../../services/appointmentService";
import { 
  Check, AlertCircle, CheckCircle2, ShieldCheck, X 
} from "lucide-react";
import { FaCalendarAlt, FaStethoscope, FaUserMd, FaCreditCard, FaLock } from "react-icons/fa";
import "../../pages/BookAppointment.css"; // Reuse booking styles
import "./PatientDashboard.css"; // Include payment modal overlay styles
import "./PatientBookAppointment.css";

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "02:00 PM", "03:00 PM", "04:00 PM"
];

const MOCK_DEFAULT_DOCTORS = [
  {
    _id: "mock-doc-1",
    specialization: "Cardiology",
    experience: 12,
    consultationFee: 800,
    hospital: "Apollo Hospitals",
    address: "Bannerghatta Road, Bangalore",
    profileImage: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    user: { name: "Dr. Sarah Jenkins" }
  },
  {
    _id: "mock-doc-2",
    specialization: "Neurology",
    experience: 15,
    consultationFee: 1200,
    hospital: "Fortis Healthcare",
    address: "Cunningham Road, Bangalore",
    profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    user: { name: "Dr. Matthew Chambers" }
  },
  {
    _id: "mock-doc-3",
    specialization: "General Physician",
    experience: 8,
    consultationFee: 500,
    hospital: "Manipal Hospitals",
    address: "HAL Road, Bangalore",
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    user: { name: "Dr. Priya Sharma" }
  },
  {
    _id: "mock-doc-4",
    specialization: "Dental Care",
    experience: 10,
    consultationFee: 600,
    hospital: "Max Healthcare",
    address: "Saket, Delhi",
    profileImage: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    user: { name: "Dr. Ronald Vance" }
  }
];

const PatientBookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const passedDoctor = location.state?.doctor || null;

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(passedDoctor?._id || "");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "4111 2222 3333 4444",
    expiry: "12/29",
    cvv: "123",
    name: user?.name || "Gaurav"
  });

  useEffect(() => {
    if (!passedDoctor) {
      const fetchDoctors = async () => {
        try {
          const data = await getAllDoctors();
          if (data.length === 0) {
            setDoctors(MOCK_DEFAULT_DOCTORS);
            setSelectedDoctorId(MOCK_DEFAULT_DOCTORS[0]._id);
          } else {
            setDoctors(data);
            if (!selectedDoctorId) {
              setSelectedDoctorId(data[0]._id);
            }
          }
        } catch (err) {
          console.error("Failed to load doctors:", err);
          setDoctors(MOCK_DEFAULT_DOCTORS);
          setSelectedDoctorId(MOCK_DEFAULT_DOCTORS[0]._id);
        }
      };
      fetchDoctors();
    }
  }, [passedDoctor, selectedDoctorId]);

  const selectedDoctor = passedDoctor || doctors.find(doc => doc._id === selectedDoctorId) || null;

  const handleDoctorChange = (e) => {
    setSelectedDoctorId(e.target.value);
  };

  const handleSlotClick = (slot) => {
    setTimeSlot(slot);
  };

  const handleCardInputChange = (e) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user || user.role !== "patient") {
      setError("Only patients can book appointments.");
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

    setPaymentProcessing(true);

    try {
      // Invoke backend booking service directly
      await bookAppointment({
        doctorId: selectedDoctorId,
        appointmentDate: date,
        appointmentTime: timeSlot,
        reason: symptoms
      });

      setSuccess("Request Successful! Appointment request submitted to doctor review.");
      
      setTimeout(() => {
        navigate("/patient/dashboard?tab=appointments");
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to finalize appointment registration.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const activeStep = !selectedDoctorId ? 1 : (!date || !timeSlot ? 2 : 3);

  return (
    <div className="booking-page-container">
      {/* Top Header bar */}
      <div className="booking-header">
        <h2>Book Appointment</h2>
        <p>Schedule clinical consultations</p>
      </div>

      {/* 3-Step Process Indicator */}
      <section className="booking-steps-section">
        <div className="steps-indicator-bar">
          <div className={`step-item ${activeStep >= 1 ? "active" : ""}`}>
            <span className="step-number">{activeStep > 1 ? <Check style={{ width: "14px", height: "14px" }} /> : "1"}</span>
            <div className="step-label-container">
              <span className="step-title-text">Choose Doctor</span>
              <span className="step-desc-text">Find specialist</span>
            </div>
          </div>
          <div className="step-divider"></div>
          <div className={`step-item ${activeStep >= 2 ? "active" : ""}`}>
            <span className="step-number">{activeStep > 2 ? <Check style={{ width: "14px", height: "14px" }} /> : "2"}</span>
            <div className="step-label-container">
              <span className="step-title-text">Select Schedule</span>
              <span className="step-desc-text">Pick date & time</span>
            </div>
          </div>
          <div className="step-divider"></div>
          <div className={`step-item ${activeStep >= 3 ? "active" : ""}`}>
            <span className="step-number">{activeStep >= 3 ? <Check style={{ width: "14px", height: "14px" }} /> : "3"}</span>
            <div className="step-label-container">
              <span className="step-title-text">Confirm Visit</span>
              <span className="step-desc-text">Submit details</span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Layout */}
      <div className="booking-grid">
        <div className="booking-card">
          <h3>Appointment Specifications</h3>

          {error && (
            <div className="error-message" style={{ marginBottom: "20px" }}>
              <AlertCircle style={{ flexShrink: 0, width: "16px", height: "16px" }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message" style={{ marginBottom: "20px" }}>
              <CheckCircle2 style={{ flexShrink: 0, width: "16px", height: "16px" }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="booking-form">
            {!passedDoctor && (
              <div className="booking-input-group">
                <label htmlFor="doctorId">Select Specialist</label>
                <div className="booking-input-wrapper">
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
                  <FaUserMd className="booking-input-icon" />
                </div>
              </div>
            )}

            <div className="booking-input-group">
              <label htmlFor="date">Appointment Date</label>
              <div className="booking-input-wrapper">
                <input
                  type="date"
                  id="date"
                  value={date}
                  min={getTodayDateString()}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <FaCalendarAlt className="booking-input-icon" />
              </div>
            </div>

            <div className="booking-input-group">
              <label>Available Time Slots</label>
              <div className="slots-grid">
                {TIME_SLOTS.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    className={`booking-slot-btn ${timeSlot === slot ? "active" : ""}`}
                    onClick={() => handleSlotClick(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-input-group">
              <label htmlFor="symptoms">Symptoms / Reason for Visit</label>
              <div className="booking-input-wrapper">
                <textarea
                  id="symptoms"
                  placeholder="Describe your symptoms or reason for visit (e.g. Fever, persistent headache, cold)..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  required
                  rows="4"
                />
                <FaStethoscope className="booking-input-icon symptoms-textarea-icon" />
              </div>
            </div>

            <button type="submit" className="booking-submit-btn" disabled={success}>
              Book Consultation
            </button>
          </form>
        </div>

        {/* Doctor Summary Info pane */}
        <div className="doctor-preview-card">
          {selectedDoctor ? (
            <>
              <img
                src={selectedDoctor.profileImage && selectedDoctor.profileImage.startsWith("http") ? selectedDoctor.profileImage : `http://localhost:5000${selectedDoctor.profileImage}`}
                alt={selectedDoctor.user?.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150";
                }}
              />
              <h4>{selectedDoctor.user?.name}</h4>
              <span className="spec-tag">{selectedDoctor.specialization}</span>

              <div className="doc-rating-mockup">
                <span className="star-icon">★</span>
                <span>4.9</span>
                <span className="review-count">(124+ reviews)</span>
              </div>

              <div className="doctor-preview-details">
                <div className="doctor-preview-row">
                  <span>Hospital Affiliation</span>
                  <span>🏥 {selectedDoctor.hospital}</span>
                </div>
                <div className="doctor-preview-row">
                  <span>Clinical Experience</span>
                  <span>{selectedDoctor.experience} Years</span>
                </div>
                <div className="doctor-preview-row">
                  <span>Consultation Fee</span>
                  <span>₹{selectedDoctor.consultationFee}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: "var(--text-secondary)" }}>
              <FaUserMd style={{ fontSize: "40px", marginBottom: "12px" }} />
              <p style={{ fontSize: "13.5px" }}>Select a specialist to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Beautiful Simulated Razorpay Payment Modal Overlay */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card">
            <div className="payment-modal-header">
              <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaLock style={{ color: "var(--primary)", fontSize: "16px" }} />
                Secure Checkout
              </h4>
              <button 
                onClick={() => setShowPaymentModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div className="payment-modal-summary">
              <p>Amount to Pay</p>
              <h2>₹{selectedDoctor?.consultationFee || 500}</h2>
            </div>

            <form onSubmit={handleConfirmPayment}>
              <div className="input-group">
                <label>Cardholder Name</label>
                <div className="input-field-wrapper">
                  <input 
                    type="text" 
                    name="name"
                    value={cardDetails.name}
                    onChange={handleCardInputChange}
                    required
                    style={{ height: "44px", background: "#F8FAFC", borderRadius: "12px", border: "1.5px solid #E2E8F0", padding: "10px 14px", fontSize: "14px", width: "100%" }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Card Number</label>
                <div className="input-field-wrapper" style={{ position: "relative" }}>
                  <input 
                    type="text" 
                    name="number"
                    value={cardDetails.number}
                    onChange={handleCardInputChange}
                    placeholder="4111 2222 3333 4444"
                    required
                    style={{ height: "44px", background: "#F8FAFC", borderRadius: "12px", border: "1.5px solid #E2E8F0", padding: "10px 14px 10px 40px", fontSize: "14px", width: "100%" }}
                  />
                  <FaCreditCard className="input-field-icon" style={{ top: "14px" }} />
                </div>
              </div>

              <div className="payment-card-input-row">
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardInputChange}
                    placeholder="MM/YY"
                    required
                    style={{ height: "44px", background: "#F8FAFC", borderRadius: "12px", border: "1.5px solid #E2E8F0", padding: "10px 14px", fontSize: "14px", width: "100%" }}
                  />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>CVV / CVC</label>
                  <input 
                    type="password" 
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardInputChange}
                    placeholder="•••"
                    maxLength="3"
                    required
                    style={{ height: "44px", background: "#F8FAFC", borderRadius: "12px", border: "1.5px solid #E2E8F0", padding: "10px 14px", fontSize: "14px", width: "100%" }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="login-submit-btn" 
                disabled={paymentProcessing}
                style={{ height: "48px", marginTop: "24px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
              >
                {paymentProcessing ? (
                  <>
                    <div className="btn-spinner"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck style={{ width: "18px", height: "18px" }} />
                    <span>Authorize Payment</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientBookAppointment;
