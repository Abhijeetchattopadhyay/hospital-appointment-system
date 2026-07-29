import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPatientAppointments, payAppointment } from "../../services/appointmentService";
import { updateProfile } from "../../services/authService";
import { 
  CalendarRange, Plus, Stethoscope, Clock, ArrowRight, FileSpreadsheet, X,
  Bell, Search, HeartPulse, LayoutDashboard, User, Settings, Home, ChevronRight
} from "lucide-react";
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import "./PatientDashboard.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getFormattedToday = () => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString(undefined, options);
};

const getTabTitle = (tab) => {
  switch (tab) {
    case "dashboard": return "Overview Dashboard";
    case "appointments": return "Consultation Ledger";
    case "profile": return "Account Settings";
    case "records": return "Medical Records";
    default: return "Patient Portal";
  }
};

const renderAvatar = (user, sizeClass = "") => {
  let initials = "P";
  if (user?.name) {
    const parts = user.name.trim().split(" ");
    if (parts.length === 1) {
      initials = parts[0].charAt(0).toUpperCase();
    } else {
      initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
  }

  const gradients = [
    "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
    "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
  ];
  const colorIndex = (user?.name?.length || 0) % gradients.length;
  const background = gradients[colorIndex];

  if (user?.profileImage) {
    const src = user.profileImage.startsWith("http") ? user.profileImage : `http://localhost:5000${user.profileImage}`;
    return (
      <div className={`avatar-container-wrapper ${sizeClass}`}>
        <img 
          src={src} 
          alt={user.name} 
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div className="user-avatar-initials" style={{ background, display: "none", width: "100%", height: "100%" }}>
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className={`user-avatar-initials ${sizeClass}`} style={{ background }}>
      {initials}
    </div>
  );
};

const getTabIcon = (tab) => {
  switch (tab) {
    case "dashboard": return <LayoutDashboard className="header-title-icon" />;
    case "appointments": return <CalendarRange className="header-title-icon" />;
    case "profile": return <User className="header-title-icon" />;
    case "records": return <FileSpreadsheet className="header-title-icon" />;
    default: return null;
  }
};

const getTabSubtitle = (tab) => {
  switch (tab) {
    case "dashboard": return "Your health summary, vital signs, and upcoming consultations.";
    case "appointments": return "Manage your scheduled doctor visits, bookings, and fee invoices.";
    case "profile": return "Update your clinical demographics, blood group, and contact card.";
    case "records": return "View your official clinical prescriptions and consultation documents.";
    default: return "Patient Portal Workspace Panel";
  }
};

const PatientDashboard = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [editFormData, setEditFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    city: "",
    phone: "",
    bloodGroup: "",
    height: "",
    weight: ""
  });

  const [quickVitals, setQuickVitals] = useState({ height: "", weight: "" });
  const [quickVitalsLoading, setQuickVitalsLoading] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const userWaterKey = user ? `water_${user.id || user._id}_${getTodayDateString()}` : null;
  const userStepsKey = user ? `steps_${user.id || user._id}_${getTodayDateString()}` : null;

  const [waterIntake, setWaterIntake] = useState(() => {
    if (userWaterKey) {
      const saved = localStorage.getItem(userWaterKey);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [stepsCount, setStepsCount] = useState(() => {
    if (userStepsKey) {
      const saved = localStorage.getItem(userStepsKey);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [stepInput, setStepInput] = useState("");

  useEffect(() => {
    if (userWaterKey) {
      localStorage.setItem(userWaterKey, waterIntake.toString());
    }
  }, [waterIntake, userWaterKey]);

  useEffect(() => {
    if (userStepsKey) {
      localStorage.setItem(userStepsKey, stepsCount.toString());
    }
  }, [stepsCount, userStepsKey]);

  const handleWaterClick = (index) => {
    setWaterIntake(index + 1);
  };

  const addGlass = () => {
    if (waterIntake < 8) {
      setWaterIntake(prev => prev + 1);
    }
  };

  const resetWater = () => {
    setWaterIntake(0);
  };

  const handleAddSteps = () => {
    const steps = parseInt(stepInput, 10);
    if (!isNaN(steps) && steps > 0) {
      setStepsCount(prev => prev + steps);
      setStepInput("");
    }
  };

  const resetSteps = () => {
    setStepsCount(0);
  };

  const handleQuickVitalsSave = async (e) => {
    e.preventDefault();
    setQuickVitalsLoading(true);
    try {
      const response = await updateProfile({
        ...user,
        height: Number(quickVitals.height),
        weight: Number(quickVitals.weight)
      });
      updateUser(response.user);
    } catch (err) {
      console.error("Failed to save quick vitals:", err);
    } finally {
      setQuickVitalsLoading(false);
    }
  };

  const calculateBMI = (h, w) => {
    const heightInMeters = Number(h) / 100;
    const weightInKg = Number(w);
    if (!heightInMeters || !weightInKg) return null;
    const bmiVal = weightInKg / (heightInMeters * heightInMeters);
    return bmiVal.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    const val = parseFloat(bmi);
    if (isNaN(val)) return { name: "Not Specified", class: "unknown", color: "var(--text-muted)", recommendation: "" };
    if (val < 18.5) return { name: "Underweight", class: "underweight", color: "#06B6D4", recommendation: "Focus on nutrient-dense foods and strength building." };
    if (val < 25) return { name: "Normal", class: "normal", color: "#10B981", recommendation: "Maintain your balanced diet and regular physical activity." };
    if (val < 30) return { name: "Overweight", class: "overweight", color: "#F59E0B", recommendation: "Consider a caloric deficit and more aerobic exercise." };
    return { name: "Obese", class: "obese", color: "#EF4444", recommendation: "Consult a dietitian or healthcare provider for guidance." };
  };

  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || "",
        dob: user.dob || "",
        gender: user.gender || "",
        city: user.city || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "",
        height: user.height || "",
        weight: user.weight || ""
      });
      setQuickVitals({
        height: user.height || "",
        weight: user.weight || ""
      });
    }
  }, [user, isEditing]);

  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileCancel = () => {
    setIsEditing(false);
    setProfileError("");
    setProfileSuccess("");
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await updateProfile(editFormData);
      updateUser(response.user);
      setProfileSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setProfileError(err.response?.data?.message || "Failed to save profile details. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDisplayDOBAndAge = (dobString) => {
    if (!dobString) return "Not Specified";
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return dobString;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    const day = String(dob.getDate()).padStart(2, '0');
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const year = dob.getFullYear();

    return `${age} Years (${day}/${month}/${year})`;
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewRxModalOpen, setIsViewRxModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const openViewRxModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewRxModalOpen(true);
  };

  const handlePaymentSubmit = async (appointmentId) => {
    try {
      setLoading(true);
      await payAppointment(appointmentId);
      const data = await getPatientAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Payment registration failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAppointments = async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        const data = await getPatientAppointments();
        setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        if (!isSilent) setLoading(false);
      }
    };

    fetchAppointments(false);

    // Live real-time polling interval (every 4 seconds)
    const liveInterval = setInterval(() => {
      fetchAppointments(true);
    }, 4000);

    // Live update when window regains focus / user switches tabs
    const handleWindowFocus = () => {
      fetchAppointments(true);
    };
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(liveInterval);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const [dismissedNotifs, setDismissedNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem("dismissed_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const dismissNotification = (id) => {
    const updated = [...dismissedNotifs, id];
    setDismissedNotifs(updated);
    localStorage.setItem("dismissed_notifications", JSON.stringify(updated));
  };

  // Generate notifications dynamically
  const notifications = [];
  appointments.forEach(app => {
    if (dismissedNotifs.includes(app._id)) return;

    if (app.status === "approved" && app.paymentStatus === "pending") {
      notifications.push({
        id: app._id,
        type: "payment-required",
        icon: "🔔",
        text: `Your appointment with Dr. ${app.doctor?.user?.name || "Doctor"} on ${formatDate(app.appointmentDate)} at ${app.appointmentTime} has been approved. Please make the payment for further process.`,
        action: (
          <button className="notification-pay-btn" onClick={() => handlePaymentSubmit(app._id)}>
            Pay Fee (₹{app.amount})
          </button>
        )
      });
    } else if ((app.status === "rejected" || app.status === "cancelled") && app.paymentStatus !== "paid") {
      notifications.push({
        id: app._id,
        type: "declined",
        icon: "⚠️",
        text: `Dr. ${app.doctor?.user?.name || "Doctor"} is not available for the slot on ${formatDate(app.appointmentDate)} at ${app.appointmentTime}. Kindly book for another slot.`
      });
    }
  });

  const renderStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="status-badge approved">
            <FaCheckCircle className="badge-icon" /> Approved
          </span>
        );
      case "completed":
        return (
          <span className="status-badge completed">
            <FaCheckCircle className="badge-icon" /> Completed
          </span>
        );
      case "cancelled":
      case "rejected":
        return (
          <span className="status-badge cancelled">
            <FaTimesCircle className="badge-icon" /> Rejected
          </span>
        );
      default:
        return (
          <span className="status-badge pending">
            <FaHourglassHalf className="badge-icon" /> Pending
          </span>
        );
    }
  };


  // Stats Counters
  const totalAppointmentsCount = appointments.length;
  const pendingVisitsCount = appointments.filter(a => a.status === "pending").length;
  const approvedVisitsCount = appointments.filter(a => a.status === "approved").length;
  const completedVisitsCount = appointments.filter(a => a.status === "completed").length;

  return (
    <main className="dashboard-main">
      {/* Top Header bar */}
      <div className="dashboard-top-bar">
        <div className="header-title-block">
          <div className="header-breadcrumb">
            <span className="breadcrumb-item">
              <Home className="breadcrumb-icon" />
              <span>Portal</span>
            </span>
            <ChevronRight className="breadcrumb-chevron" />
            <span className="breadcrumb-current">{getTabTitle(activeTab)}</span>
          </div>
          <div className="header-main-title">
            <div className="header-title-icon-wrapper">
              {getTabIcon(activeTab)}
            </div>
            <div className="header-title-text-group">
              <h2>{getTabTitle(activeTab)}</h2>
              <p>{getTabSubtitle(activeTab)}</p>
            </div>
          </div>
        </div>

        {/* Global Search Mockup Panel */}
        <div className="header-search-mockup">
          <Search className="search-mock-icon" />
          <span className="search-mock-text">Search records, files...</span>
          <kbd className="search-kbd-badge">⌘K</kbd>
        </div>

        <div className="header-right-widgets">
          <div className="system-status-indicator" title="Secure Encrypted Connection">
            <span className="status-dot-pulse"></span>
            <span>Secure</span>
          </div>
          <div className="header-notif-bell" title="Notifications">
            <Bell style={{ width: "20px", height: "20px" }} />
            {notifications.length > 0 && <span className="notif-badge-pulsing"></span>}
          </div>
          <div className="user-profile-badge">
            {renderAvatar(user)}
            <div className="profile-badge-text">
              <h4>{user?.name || "Patient"}</h4>
              <p>Medical ID: MC-{user?.id?.slice(0, 5) || "0912"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="dashboard-notifications-container">
          {notifications.map((notif) => (
            <div key={notif.id} className={`dashboard-notification-bar ${notif.type}`}>
              <div className="notification-content">
                <span className="notification-icon">{notif.icon}</span>
                <p className="notification-text">{notif.text}</p>
              </div>
              <div className="notification-actions">
                {notif.action && notif.action}
                <button className="notification-close-btn" onClick={() => dismissNotification(notif.id)} title="Dismiss">
                  <X style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conditional Tab Views */}
      {activeTab === "dashboard" && (
        <>
          {/* Welcome banner */}
          <div className="patient-welcome-banner">
            <div className="banner-left-pane">
              <h3>{getGreeting()}, {user?.name || "Patient"}!</h3>
              <p>
                Your general health index is looking great today. Check your upcoming scheduled 
                consultation summaries or download your medical records reports.
              </p>
            </div>
            <div className="banner-right-pane">
              <Link to="/patient/book-appointment" className="banner-cta-glass-btn">
                <Plus style={{ width: "18px", height: "18px" }} />
                <span>Book Consultation</span>
              </Link>
            </div>
          </div>

          {/* Missing Vitals Alert Banner */}
          {(!user?.height || !user?.weight) && (
            <div className="vitals-setup-banner">
              <div className="vitals-setup-content">
                <div className="vitals-setup-header">
                  <span className="vitals-setup-icon">🏥</span>
                  <div className="vitals-setup-text">
                    <h4>Complete Your Health Profile</h4>
                    <p>Enter your height and weight to calculate your BMI and enable personalized health tracking.</p>
                  </div>
                </div>
                <form onSubmit={handleQuickVitalsSave} className="vitals-setup-form">
                  <div className="vitals-setup-inputs">
                    <div className="setup-input-wrapper">
                      <input
                        type="number"
                        placeholder="Height"
                        value={quickVitals.height}
                        onChange={(e) => setQuickVitals({ ...quickVitals, height: e.target.value })}
                        required
                        min="50"
                        max="250"
                        className="setup-number-input"
                      />
                      <span className="setup-unit">cm</span>
                    </div>
                    <div className="setup-input-wrapper">
                      <input
                        type="number"
                        placeholder="Weight"
                        value={quickVitals.weight}
                        onChange={(e) => setQuickVitals({ ...quickVitals, weight: e.target.value })}
                        required
                        min="10"
                        max="300"
                        className="setup-number-input"
                      />
                      <span className="setup-unit">kg</span>
                    </div>
                  </div>
                  <button type="submit" className="vitals-setup-submit-btn" disabled={quickVitalsLoading}>
                    {quickVitalsLoading ? "Saving..." : "Save Vitals"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <section className="patient-stats-row">
            <div className="patient-stat-card">
              <div className="patient-stat-icon blue">
                <CalendarRange />
              </div>
              <div className="patient-stat-details">
                <h4>{totalAppointmentsCount}</h4>
                <p>Total Booked</p>
                <span className="stat-trend-text">All time bookings</span>
              </div>
            </div>

            <div className="patient-stat-card">
              <div className="patient-stat-icon orange">
                <Clock />
              </div>
              <div className="patient-stat-details">
                <h4>{pendingVisitsCount}</h4>
                <p>Pending Review</p>
                <span className="stat-trend-text">{pendingVisitsCount > 0 ? "Awaiting doctor" : "All cleared"}</span>
              </div>
            </div>

            <div className="patient-stat-card">
              <div className="patient-stat-icon green">
                <FaCheckCircle />
              </div>
              <div className="patient-stat-details">
                <h4>{approvedVisitsCount}</h4>
                <p>Approved Visits</p>
                <span className="stat-trend-text">{approvedVisitsCount > 0 ? "Upcoming slot active" : "No active visits"}</span>
              </div>
            </div>

            <div className="patient-stat-card">
              <div className="patient-stat-icon purple">
                <FileSpreadsheet />
              </div>
              <div className="patient-stat-details">
                <h4>{completedVisitsCount}</h4>
                <p>Medical Records</p>
                <span className="stat-trend-text">Clinical prescriptions</span>
              </div>
            </div>
          </section>

          {/* Body 2-Column Grid */}
          <div className="patient-dashboard-grid">
            {/* Left Column widgets */}
            <div className="dashboard-grid-column">
              {/* Upcoming Appointments */}
              <div className="dashboard-panel-card">
                <div className="panel-header-row">
                  <h3>Upcoming Consultation Slots</h3>
                  <button onClick={() => setSearchParams({ tab: "appointments" })} className="view-all-btn">
                    View All <ArrowRight className="btn-arrow-icon" />
                  </button>
                </div>

                {loading ? (
                  <div className="skeleton-loader-bar"></div>
                ) : appointments.length > 0 ? (
                  <div className="appointments-list-container">
                    {appointments.slice(0, 2).map((app) => (
                      <div key={app._id} className="appointment-card-item">
                        <div className="doctor-meta-block">
                          <img 
                            src={`http://localhost:5000${app.doctor?.profileImage}`} 
                            alt={app.doctor?.user?.name}
                            className="doctor-avatar-circle"
                            onError={(e) => {
                               e.target.onerror = null;
                               e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150";
                            }}
                          />
                          <div className="doctor-info-block">
                            <h5 className="doctor-name-title">{app.doctor?.user?.name}</h5>
                            <p className="doctor-spec-subtitle">
                              <Stethoscope className="small-icon" /> {app.doctor?.specialization}
                            </p>
                          </div>
                        </div>
                        <div className="appointment-time-block">
                          <span className="appointment-date-text">{formatDate(app.appointmentDate)}</span>
                          <span className="appointment-time-text">{app.appointmentTime}</span>
                        </div>
                        <div className="appointment-actions-block" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {renderStatusBadge(app.status)}
                            {app.paymentStatus === "paid" ? (
                              <span className="payment-badge paid">Paid</span>
                            ) : (
                              <span className="payment-badge unpaid">Unpaid</span>
                            )}
                          </div>
                          {app.status === "completed" && (
                            <button className="view-rx-action-btn" onClick={() => openViewRxModal(app)}>
                              View Rx
                            </button>
                          )}
                          {app.status === "approved" && app.paymentStatus !== "paid" && (
                            <button className="table-pay-btn" onClick={() => handlePaymentSubmit(app._id)}>
                              Pay Fee (₹{app.amount})
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-text-panel">
                    <div className="empty-state-icon-container">
                      <CalendarRange style={{ width: "24px", height: "24px" }} />
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 6px 0", color: "var(--text-primary)", fontWeight: "700" }}>No upcoming consults</h4>
                      <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-muted)" }}>Your health schedule is clear for today.</p>
                    </div>
                    <Link to="/patient/book-appointment" className="empty-state-btn" style={{ textDecoration: "none" }}>
                      Book Appointment
                    </Link>
                  </div>
                )}
              </div>

              {/* Interactive Daily Trackers */}
              <div className="dashboard-panel-card daily-trackers-card">
                <h3>Daily Health & Activity Trackers</h3>
                <p className="trackers-subtitle">Log your daily progress to build healthy habits.</p>
                
                <div className="trackers-grid">
                  {/* Water Tracker */}
                  <div className="tracker-tile water-tracker">
                    <div className="tracker-header">
                      <div className="tracker-title-group">
                        <span className="tracker-icon">💧</span>
                        <div>
                          <h5>Water Hydration</h5>
                          <p>Daily Goal: 8 Glasses (2L)</p>
                        </div>
                      </div>
                      <span className="tracker-counter">{waterIntake} / 8</span>
                    </div>

                    <div className="water-glasses-container">
                      {[...Array(8)].map((_, i) => (
                        <button
                          key={i}
                          className={`water-glass-btn ${i < waterIntake ? 'filled' : ''}`}
                          onClick={() => handleWaterClick(i)}
                          title={`Log Glass ${i + 1}`}
                        >
                          <div className="water-wave"></div>
                        </button>
                      ))}
                    </div>

                    <div className="tracker-actions">
                      <button className="tracker-btn reset-btn" onClick={resetWater}>Reset</button>
                      <button className="tracker-btn increment-btn" onClick={addGlass} disabled={waterIntake >= 8}>+ Add Glass</button>
                    </div>
                  </div>

                  {/* Steps Tracker */}
                  <div className="tracker-tile steps-tracker">
                    <div className="tracker-header">
                      <div className="tracker-title-group">
                        <span className="tracker-icon">👣</span>
                        <div>
                          <h5>Steps Log</h5>
                          <p>Daily Goal: 10,000 steps</p>
                        </div>
                      </div>
                      <span className="tracker-counter">{stepsCount.toLocaleString()} / 10,000</span>
                    </div>

                    <div className="steps-progress-wrapper">
                      <svg className="progress-circle" viewBox="0 0 100 100">
                        <circle className="progress-circle-bg" cx="50" cy="50" r="40" />
                        <circle
                          className="progress-circle-fill"
                          cx="50"
                          cy="50"
                          r="40"
                          style={{
                            strokeDasharray: 251.2,
                            strokeDashoffset: 251.2 - (251.2 * Math.min(1, stepsCount / 10000))
                          }}
                        />
                      </svg>
                      <div className="progress-text-center">
                        <span className="percent-text">{Math.round(Math.min(100, (stepsCount / 10000) * 100))}%</span>
                        <span className="label-text">Goal</span>
                      </div>
                    </div>

                    <div className="steps-logger-form">
                      <input
                        type="number"
                        placeholder="Add steps..."
                        value={stepInput}
                        onChange={(e) => setStepInput(e.target.value)}
                        className="steps-input-field"
                      />
                      <button className="steps-add-btn" onClick={handleAddSteps}>Add</button>
                      <button className="steps-reset-btn" onClick={resetSteps} title="Reset steps">↺</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column widgets */}
            <div className="dashboard-grid-column">
              {/* Profile Card */}
              <div className="dashboard-panel-card" style={{ padding: "30px 24px" }}>
                <div className="patient-profile-side-card" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "20px", marginBottom: "20px" }}>
                  {renderAvatar(user)}
                  <h4>{user?.name}</h4>
                  <p>Patient Account</p>
                  
                  {/* Dynamic health vitals metrics */}
                  <div className="patient-vitals-row">
                    <div className="vital-metric-tile">
                      <span>Height</span>
                      <span>{user?.height ? `${user.height} cm` : "N/A"}</span>
                    </div>
                    <div className="vital-metric-tile">
                      <span>Weight</span>
                      <span>{user?.weight ? `${user.weight} kg` : "N/A"}</span>
                    </div>
                    <div className="vital-metric-tile">
                      <span>BMI</span>
                      <span>{user?.height && user?.weight ? calculateBMI(user.height, user.weight) : "N/A"}</span>
                    </div>
                  </div>

                  {user?.height && user?.weight ? (
                    <div className="bmi-gauge-wrapper">
                      {(() => {
                        const bmi = calculateBMI(user.height, user.weight);
                        const category = getBMICategory(bmi);
                        return (
                          <div className={`bmi-gauge-card ${category.class}`}>
                            <div className="bmi-gauge-header">
                              <span className="bmi-gauge-badge" style={{ backgroundColor: category.color }}>
                                {category.name}
                              </span>
                              <span className="bmi-gauge-val">BMI: {bmi}</span>
                            </div>
                            <div className="bmi-gauge-bar-bg">
                              <div 
                                className="bmi-gauge-bar-fill" 
                                style={{ 
                                  backgroundColor: category.color,
                                  width: `${Math.min(100, Math.max(10, (parseFloat(bmi) / 40) * 100))}%`
                                }}
                              ></div>
                            </div>
                            <p className="bmi-recommendation-text">{category.recommendation}</p>
                          </div>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>

                <div className="profile-meta-row">
                  <span>Blood Group</span>
                  <span>{user?.bloodGroup || "Not Specified"}</span>
                </div>
                <div className="profile-meta-row">
                  <span>Age / Gender</span>
                  <span>{user?.dob ? `${formatDisplayDOBAndAge(user.dob).split(" ")[0]} Yrs` : "N/A"} / {user?.gender || "Not Specified"}</span>
                </div>
                <div className="profile-meta-row">
                  <span>Contact Phone</span>
                  <span>{user?.phone || "Not Specified"}</span>
                </div>
                <div className="profile-meta-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
                  <span>Primary Email</span>
                  <span style={{ fontSize: "12.5px", wordBreak: "break-all" }}>{user?.email}</span>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="dashboard-panel-card">
                <h3>Portal Quick Actions</h3>
                <div className="quick-actions-grid">
                  <Link to="/patient/book-appointment" className="quick-action-tile">
                    <div className="quick-action-icon blue-theme">
                      <Plus />
                    </div>
                    <span>New Booking</span>
                  </Link>

                  <Link to="/doctors" className="quick-action-tile">
                    <div className="quick-action-icon green-theme">
                      <Stethoscope />
                    </div>
                    <span>Find Doctors</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "appointments" && (
        <div className="dashboard-panel-card">
          <h3 className="section-title">Scheduled Consultations Ledger</h3>
          {loading ? (
            <div className="skeleton-loader-bar tall"></div>
          ) : appointments.length > 0 ? (
            <div className="table-responsive">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions / Rx</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>
                        <div className="doc-table-meta">
                          <img
                            src={`http://localhost:5000${appointment.doctor?.profileImage}`}
                            alt={appointment.doctor?.user?.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150";
                            }}
                          />
                          <div className="doc-table-text">
                            <h4>{appointment.doctor?.user?.name}</h4>
                            <p>{appointment.doctor?.specialization}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-date-time-block">
                          <span className="table-date">
                            <FaCalendarAlt className="table-icon" />
                            {formatDate(appointment.appointmentDate)}
                          </span>
                          <span className="table-time">
                            <Clock className="table-icon-small" />
                            {appointment.appointmentTime}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="table-reason">
                          <Stethoscope className="table-reason-icon" />
                          {appointment.reason}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {renderStatusBadge(appointment.status)}
                          {appointment.paymentStatus === "paid" ? (
                            <span className="payment-badge paid">Paid</span>
                          ) : (
                            <span className="payment-badge unpaid">Unpaid</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                          {appointment.status === "completed" && (
                            <button
                              className="table-view-rx-btn"
                              onClick={() => openViewRxModal(appointment)}
                            >
                              View Prescription
                            </button>
                          )}
                          {appointment.status === "approved" && appointment.paymentStatus !== "paid" && (
                            <button
                              className="table-pay-btn"
                              onClick={() => handlePaymentSubmit(appointment._id)}
                            >
                              Pay Fee (₹{appointment.amount})
                            </button>
                          )}
                          {appointment.status !== "completed" && (appointment.status !== "approved" || appointment.paymentStatus === "paid") && (
                            <span className="table-na-text">N/A</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-appointments-card">
              <CalendarRange className="no-appointments-icon" />
              <h3>No Appointments Found</h3>
              <p>You haven't scheduled any appointments yet. Click the button above to book now!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="dashboard-panel-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0 }}>Detailed Demographics Profile</h3>
            {!isEditing ? (
              <button 
                className="profile-edit-toggle-btn"
                onClick={() => setIsEditing(true)}
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 16px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  className="profile-save-btn"
                  onClick={handleProfileSave}
                  disabled={saveLoading}
                  style={{
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    fontWeight: "750",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.15)"
                  }}
                >
                  {saveLoading ? "Saving..." : "💾 Save"}
                </button>
                <button 
                  className="profile-cancel-btn"
                  onClick={handleProfileCancel}
                  style={{
                    background: "#F1F5F9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {profileSuccess && (
            <div className="success-message" style={{ marginBottom: "20px" }}>
              <FaCheckCircle style={{ flexShrink: 0 }} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="error-message" style={{ marginBottom: "20px" }}>
              <FaExclamationTriangle style={{ flexShrink: 0 }} />
              <span>{profileError}</span>
            </div>
          )}

          <div className="profile-inputs-grid">
            <div className="profile-input-group">
              <label>Full Patient Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="name"
                  value={editFormData.name} 
                  onChange={handleEditInputChange}
                  className="profile-edit-input" 
                  required
                />
              ) : (
                <input type="text" readOnly value={user?.name || ""} className="profile-readonly-input" />
              )}
            </div>
            <div className="profile-input-group">
              <label>Primary E-mail Address</label>
              <input type="text" readOnly value={user?.email || ""} className="profile-readonly-input" title="Email cannot be changed" />
            </div>
            <div className="profile-input-group">
              <label>Age / DOB</label>
              {isEditing ? (
                <input 
                  type="date" 
                  name="dob"
                  value={editFormData.dob} 
                  onChange={handleEditInputChange}
                  className="profile-edit-input" 
                />
              ) : (
                <input type="text" readOnly value={formatDisplayDOBAndAge(user?.dob)} className="profile-readonly-input" />
              )}
            </div>
            <div className="profile-input-group">
              <label>Biological Gender</label>
              {isEditing ? (
                <select 
                  name="gender"
                  value={editFormData.gender} 
                  onChange={handleEditInputChange}
                  className="profile-edit-select"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input type="text" readOnly value={user?.gender || "Not Specified"} className="profile-readonly-input" />
              )}
            </div>
            <div className="profile-input-group">
              <label>Residential City</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="city"
                  placeholder="e.g. Bangalore, Karnataka"
                  value={editFormData.city} 
                  onChange={handleEditInputChange}
                  className="profile-edit-input" 
                />
              ) : (
                <input type="text" readOnly value={user?.city || "Not Specified"} className="profile-readonly-input" />
              )}
            </div>
             <div className="profile-input-group">
              <label>Primary Contact Number</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="phone"
                  placeholder="e.g. +1 (555) 091-2345"
                  value={editFormData.phone} 
                  onChange={handleEditInputChange}
                  className="profile-edit-input" 
                />
              ) : (
                <input type="text" readOnly value={user?.phone || "Not Specified"} className="profile-readonly-input" />
              )}
            </div>
            <div className="profile-input-group">
              <label>Blood Group</label>
              {isEditing ? (
                <select 
                  name="bloodGroup"
                  value={editFormData.bloodGroup} 
                  onChange={handleEditInputChange}
                  className="profile-edit-select"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A-Positive (A+)</option>
                  <option value="A-">A-Negative (A-)</option>
                  <option value="B+">B-Positive (B+)</option>
                  <option value="B-">B-Negative (B-)</option>
                  <option value="AB+">AB-Positive (AB+)</option>
                  <option value="AB-">AB-Negative (AB-)</option>
                  <option value="O+">O-Positive (O+)</option>
                  <option value="O-">O-Negative (O-)</option>
                </select>
              ) : (
                <input type="text" readOnly value={user?.bloodGroup || "Not Specified"} className="profile-readonly-input" />
              )}
            </div>
            <div className="profile-input-group">
              <label>Height (cm)</label>
              {isEditing ? (
                <input 
                  type="number" 
                  name="height"
                  value={editFormData.height} 
                  onChange={handleEditInputChange}
                  className="profile-edit-input" 
                  placeholder="e.g. 180"
                  min="50"
                  max="250"
                />
              ) : (
                <input type="text" readOnly value={user?.height ? `${user.height} cm` : "Not Specified"} className="profile-readonly-input" />
              )}
            </div>
            <div className="profile-input-group">
              <label>Weight (kg)</label>
              {isEditing ? (
                <input 
                  type="number" 
                  name="weight"
                  value={editFormData.weight} 
                  onChange={handleEditInputChange}
                  className="profile-edit-input" 
                  placeholder="e.g. 75"
                  min="10"
                  max="300"
                />
              ) : (
                <input type="text" readOnly value={user?.weight ? `${user.weight} kg` : "Not Specified"} className="profile-readonly-input" />
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "records" && (
        <div className="dashboard-panel-card">
          <div className="records-header">
            <div>
              <h3>Medical Records</h3>
              <p className="section-description">
                Prescriptions and medical advice added by your doctors after each consultation.
              </p>
            </div>
            <button
              className="records-refresh-btn"
              onClick={async () => {
                setLoading(true);
                try {
                  const data = await getPatientAppointments();
                  setAppointments(data);
                } catch (err) {
                  console.error("Refresh failed:", err);
                } finally {
                  setLoading(false);
                }
              }}
              title="Refresh records"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="records-loading-state">
              <div className="records-spinner"></div>
              <p>Loading your medical records...</p>
            </div>
          ) : appointments.filter(app => app.status === "completed").length > 0 ? (
            <div className="records-list">
              {appointments
                .filter(app => app.status === "completed")
                .map((app) => (
                  <div key={app._id} className={`record-row-item completed-border ${app.prescription ? "has-rx" : "no-rx"}`}>
                    <div className="file-info-block">
                      <div className={`prescription-icon-wrapper ${app.prescription ? "rx-available" : "rx-missing"}`}>
                        <Stethoscope />
                      </div>
                      <div className="file-text-block">
                        <div className="file-name-row">
                          <h5 className="file-name">
                            Dr. {app.doctor?.user?.name || "Unknown Doctor"}
                          </h5>
                          {app.prescription ? (
                            <span className="rx-badge rx-badge--available">✓ Rx Available</span>
                          ) : (
                            <span className="rx-badge rx-badge--pending">⏳ Rx Pending</span>
                          )}
                        </div>
                        <p className="file-meta">
                          <span className="record-specialization">{app.doctor?.specialization || "Specialist"}</span>
                          <span className="record-dot">•</span>
                          <span>{formatDate(app.appointmentDate)}</span>
                          <span className="record-dot">•</span>
                          <span>{app.appointmentTime}</span>
                        </p>
                        {app.prescription && (
                          <p className="rx-preview-text">
                            {app.prescription.length > 80
                              ? app.prescription.substring(0, 80) + "..."
                              : app.prescription}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className={`prescription-view-btn ${!app.prescription ? "prescription-view-btn--disabled" : ""}`}
                      onClick={() => app.prescription && openViewRxModal(app)}
                      disabled={!app.prescription}
                      title={app.prescription ? "View full prescription" : "Prescription not yet added by doctor"}
                    >
                      {app.prescription ? "View Rx" : "No Rx Yet"}
                    </button>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="records-empty-state">
              <div className="records-empty-icon">📋</div>
              <h4>No Medical Records Yet</h4>
              <p>Your prescriptions will appear here once a doctor completes your consultation.</p>
              <a href="/patient/book-appointment" className="records-book-btn">
                Book a Consultation
              </a>
            </div>
          )}
        </div>
      )}

      {/* View Prescription Modal */}
      {isViewRxModalOpen && selectedAppointment && (
        <div className="custom-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsViewRxModalOpen(false)}>
          <div className="custom-modal-content rx-modal-enhanced">
            <div className="custom-modal-header">
              <div className="rx-modal-title-block">
                <div className="rx-modal-icon">💊</div>
                <div>
                  <h3>Prescription Details</h3>
                  <p className="rx-modal-subtitle">Issued by Dr. {selectedAppointment?.doctor?.user?.name}</p>
                </div>
              </div>
              <button className="close-modal-btn" onClick={() => setIsViewRxModalOpen(false)}>&times;</button>
            </div>
            <div className="custom-modal-body">
              <div className="rx-meta-strip">
                <div className="rx-meta-item">
                  <span className="rx-meta-label">Doctor</span>
                  <span className="rx-meta-value">Dr. {selectedAppointment?.doctor?.user?.name}</span>
                </div>
                <div className="rx-meta-item">
                  <span className="rx-meta-label">Specialization</span>
                  <span className="rx-meta-value">{selectedAppointment?.doctor?.specialization}</span>
                </div>
                <div className="rx-meta-item">
                  <span className="rx-meta-label">Date</span>
                  <span className="rx-meta-value">{formatDate(selectedAppointment?.appointmentDate)}</span>
                </div>
                <div className="rx-meta-item">
                  <span className="rx-meta-label">Time</span>
                  <span className="rx-meta-value">{selectedAppointment?.appointmentTime}</span>
                </div>
                <div className="rx-meta-item">
                  <span className="rx-meta-label">Fee Paid</span>
                  <span className="rx-meta-value">₹{selectedAppointment?.amount}</span>
                </div>
                <div className="rx-meta-item">
                  <span className="rx-meta-label">Reason</span>
                  <span className="rx-meta-value">{selectedAppointment?.reason}</span>
                </div>
              </div>

              <div className="rx-prescription-card">
                <div className="rx-prescription-header">
                  <span className="rx-symbol">℞</span>
                  <h4>Prescribed Medication &amp; Advice</h4>
                </div>
                <div className="rx-prescription-body">
                  {selectedAppointment?.prescription ? (
                    <p className="rx-advice-text">{selectedAppointment.prescription}</p>
                  ) : (
                    <p className="rx-no-prescription">No prescription details have been provided by the doctor yet.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="custom-modal-footer">
              <button type="button" className="close-rx-btn" onClick={() => setIsViewRxModalOpen(false)}>
                Close
              </button>
              {selectedAppointment?.prescription && (
                <button
                  type="button"
                  className="print-rx-btn"
                  onClick={() => window.print()}
                >
                  🖨️ Print Rx
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PatientDashboard;