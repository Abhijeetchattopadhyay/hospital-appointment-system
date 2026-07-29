import { useState, useEffect, useRef } from "react";
import Footer from "../../components/common/Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { getDoctorProfile, createDoctorProfile, updateDoctorProfile, uploadDoctorPhoto } from "../../services/doctorService";
import { getDoctorAppointments, updateAppointmentStatus } from "../../services/appointmentService";
import { getImageUrl } from "../../utils/imageUrl";
import { 
  FaUserMd, FaHospital, FaRegClock, FaRupeeSign, FaCheck, 
  FaTimes, FaCalendarAlt, FaClock, FaStethoscope, FaCamera, 
  FaCheckCircle, FaExclamationTriangle, FaGraduationCap, FaMapMarkerAlt, 
  FaHourglassHalf, FaShieldAlt, FaThLarge, FaCog, FaUserCircle, 
  FaEnvelope, FaCreditCard, FaRegQuestionCircle, FaBell, FaSignOutAlt, FaMars, FaVenus, FaBaby
} from "react-icons/fa";
import "./DoctorDashboard.css";

const renderPatientAvatar = (patient) => {
  let initials = "P";
  if (patient?.name) {
    const parts = patient.name.trim().split(" ");
    if (parts.length === 1) {
      initials = parts[0].charAt(0).toUpperCase();
    } else {
      initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
  } else {
    initials = patient?.email?.charAt(0).toUpperCase() || "P";
  }
  
  const gradients = [
    "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
    "linear-gradient(135deg, #10B981 0%, #047857 100%)",
    "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
    "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
  ];
  const colorIndex = (patient?.name?.length || patient?.email?.length || 0) % gradients.length;
  const background = gradients[colorIndex];
  
  return (
    <div className="table-patient-avatar-placeholder" style={{ background }}>
      {initials}
    </div>
  );
};

const getGenderDistribution = (appointments) => {
  if (!appointments || appointments.length === 0) {
    return { malePct: 0, femalePct: 0, childPct: 0, total: 0 };
  }

  const getAge = (dobString) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return "N/A";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const patientMap = {};
  appointments.forEach(app => {
    if (app.patient) {
      const pid = app.patient._id || app.patient.id || app.patient;
      if (pid) {
        patientMap[pid] = app.patient;
      }
    }
  });

  const uniquePatients = Object.values(patientMap);
  if (uniquePatients.length === 0) {
    return { malePct: 0, femalePct: 0, childPct: 0, total: 0 };
  }

  let maleCount = 0;
  let femaleCount = 0;
  let childCount = 0;

  uniquePatients.forEach(p => {
    const age = getAge(p.dob);
    if (age !== "N/A" && age < 18) {
      childCount++;
    } else if (p.gender && p.gender.toLowerCase() === "female") {
      femaleCount++;
    } else {
      maleCount++;
    }
  });

  const total = maleCount + femaleCount + childCount;
  if (total === 0) {
    return { malePct: 0, femalePct: 0, childPct: 0, total: 0 };
  }

  const malePct = Math.round((maleCount / total) * 100);
  const femalePct = Math.round((femaleCount / total) * 100);
  const childPct = 100 - (malePct + femalePct);

  return { malePct, femalePct, childPct, total };
};

// Build last-7-days chart data from real appointments
const buildChartData = (appointments) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build array of last 7 days (oldest first)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    days.push({ key, label, newCount: 0, returningCount: 0 });
  }

  // Sort all appointments by date asc to determine first-visit chronologically
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.createdAt || a.appointmentDate) - new Date(b.createdAt || b.appointmentDate)
  );

  // Track the first time we see each patient
  const firstSeenDate = {};
  sorted.forEach(app => {
    const pid = app.patient?._id || app.patient?.id || String(app.patient);
    const rawDate = app.appointmentDate || app.createdAt;
    if (!pid || !rawDate) return;
    // Normalise appointment date to YYYY-MM-DD
    let appDateKey;
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      appDateKey = rawDate;
    } else {
      appDateKey = new Date(rawDate).toISOString().split("T")[0];
    }
    if (!firstSeenDate[pid]) {
      firstSeenDate[pid] = appDateKey;
    }
  });

  // Now count per day within our 7-day window
  appointments.forEach(app => {
    const pid = app.patient?._id || app.patient?.id || String(app.patient);
    const rawDate = app.appointmentDate || app.createdAt;
    if (!pid || !rawDate) return;
    let appDateKey;
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      appDateKey = rawDate;
    } else {
      appDateKey = new Date(rawDate).toISOString().split("T")[0];
    }
    const dayEntry = days.find(d => d.key === appDateKey);
    if (!dayEntry) return;
    if (firstSeenDate[pid] === appDateKey) {
      dayEntry.newCount++;
    } else {
      dayEntry.returningCount++;
    }
  });

  return days;
};

// Map a value to an SVG Y coordinate within the chart area
const toY = (value, maxVal, chartHeight = 130, topPad = 15) => {
  if (maxVal === 0) return topPad + chartHeight; // bottom
  return topPad + chartHeight - Math.round((value / maxVal) * chartHeight);
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const suggestionDropdownRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "appointments", "profile"

  // Modal states for prescribing and viewing prescription
  const [isPrescribeModalOpen, setIsPrescribeModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [modalSubmitLoading, setModalSubmitLoading] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    specialization: "General Physician",
    hospital: "",
    experience: "",
    consultationFee: "",
    qualification: "",
    address: "",
  });

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // OSM Suggestions State
  const [hospSuggestions, setHospSuggestions] = useState([]);
  const [showHospSuggestions, setShowHospSuggestions] = useState(false);
  const [, setFetchingHospitals] = useState(false);

  useEffect(() => {
    // Fetch all doctor profile & appointments
    const fetchData = async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        try {
          const profileData = await getDoctorProfile();
          if (profileData) {
            setProfile(profileData);
            setFormData({
              specialization: profileData.specialization || "General Physician",
              hospital: profileData.hospital || "",
              experience: profileData.experience || "",
              consultationFee: profileData.consultationFee || "",
              qualification: profileData.qualification || "",
              address: profileData.address || "",
            });
          }
        } catch (err) {
          console.warn("Doctor profile not created yet or failed to fetch:", err);
        }

        const appointmentsData = await getDoctorAppointments();
        setAppointments(appointmentsData);
      } catch (err) {
        console.error("Dashboard failed to load fully:", err);
      } finally {
        if (!isSilent) setLoading(false);
      }
    };

    fetchData(false);

    // Live real-time polling interval (every 4 seconds)
    const liveInterval = setInterval(() => {
      fetchData(true);
    }, 4000);

    // Live update when window regains focus / user switches tabs
    const handleWindowFocus = () => {
      fetchData(true);
    };
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(liveInterval);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [refreshTrigger]);

  // Automatically switch to profile tab if credentials aren't configured yet
  useEffect(() => {
    if (!loading && !profile) {
      setActiveTab("profile");
    }
  }, [profile, loading]);

  // Click outside suggestions dropdown handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionDropdownRef.current && !suggestionDropdownRef.current.contains(e.target)) {
        setShowHospSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Trigger OSM suggestions when typing in hospital input
    if (e.target.name === "hospital") {
      const query = e.target.value;
      if (query.length > 2) {
        fetchHospitalsOSM(query);
      } else {
        setHospSuggestions([]);
        setShowHospSuggestions(false);
      }
    }
  };

  const fetchHospitalsOSM = async (query) => {
    setFetchingHospitals(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=hospital+${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setHospSuggestions(data);
      setShowHospSuggestions(data.length > 0);
    } catch (err) {
      console.error("Failed to query Nominatim hospital suggestions:", err);
    } finally {
      setFetchingHospitals(false);
    }
  };

  const handleHospitalSelect = (hosp) => {
    const cleanName = hosp.display_name.split(",")[0];
    setFormData({
      ...formData,
      hospital: cleanName,
      address: hosp.display_name
    });
    setShowHospSuggestions(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      let updatedData;
      if (profile) {
        updatedData = await updateDoctorProfile(formData);
        setProfileSuccess("Doctor profile updated successfully!");
      } else {
        updatedData = await createDoctorProfile(formData);
        setProfileSuccess("Doctor profile created successfully!");
      }
      setProfile(updatedData);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setProfileError("Failed to save profile. Please check your inputs.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileError("");
    setProfileSuccess("");

    const photoFormData = new FormData();
    photoFormData.append("profileImage", file);

    try {
      const updatedProfile = await uploadDoctorPhoto(photoFormData);
      setProfile(updatedProfile);
      setProfileSuccess("Profile picture uploaded successfully!");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setProfileError("Failed to upload profile picture. Ensure it is a valid JPG/PNG.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const openPrescribeModal = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionText("");
    setIsPrescribeModalOpen(true);
  };

  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setModalSubmitLoading(true);
    try {
      await updateAppointmentStatus(selectedAppointment._id, "completed", prescriptionText);
      setIsPrescribeModalOpen(false);
      setSelectedAppointment(null);
      setPrescriptionText("");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to submit prescription:", err);
    } finally {
      setModalSubmitLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return "N/A";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate appointments stats
  const pendingCount = appointments.filter(app => app.status === "pending").length;
  const approvedCount = appointments.filter(app => app.status === "approved" || app.status === "scheduled").length;
  const completedCount = appointments.filter(app => app.status === "completed").length;

  // Calculate earnings stats (reset on each day)
  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getTodayDateString();
  const paidAppointments = appointments.filter(app => app.paymentStatus === "paid");
  
  const todayPaidAppointments = paidAppointments.filter(app => app.appointmentDate === todayStr);
  const todayEarnings = todayPaidAppointments.reduce((sum, app) => sum + (app.amount || 0), 0);
  const totalEarnings = paidAppointments.reduce((sum, app) => sum + (app.amount || 0), 0);

  if (profile && !profile.isApproved) {
    return (
      <div className="doctor-dashboard locked-dashboard">
        <div className="lock-screen-container">
          <div className="lock-card">
            <div className="lock-icon-pulse">
              <FaShieldAlt style={{ fontSize: "36px" }} />
            </div>
            <h2>Verification Pending</h2>
            <span className="status-pill pending">Awaiting Admin Approval</span>
            <p className="lock-message">
              Hello Dr. <strong>{user?.name}</strong>, your professional medical profile has been successfully registered.
            </p>
            <p className="lock-submessage">
              To ensure clinical safety and credential standards, new doctor dashboards require manual validation and activation by the system administrator. You will gain full access as soon as your account is approved.
            </p>
            <div className="lock-details">
              <h4>Registered Credentials:</h4>
              <ul>
                <li><strong>Specialization:</strong> {profile.specialization}</li>
                <li><strong>Qualification:</strong> {profile.qualification}</li>
                <li><strong>Hospital:</strong> {profile.hospital}</li>
                <li><strong>Consultation Fee:</strong> ₹{profile.consultationFee}</li>
              </ul>
            </div>
            <button className="lock-logout-btn" onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}>
              Logout Account
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { malePct, femalePct, childPct } = getGenderDistribution(appointments);

  return (
    <div className="doctor-dashboard-layout">
      {/* 1. Left Sidebar Navigation */}
      <aside className="doctor-sidebar">
        <div className="sidebar-brand">
          <svg className="sidebar-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "28px", height: "28px", color: "var(--primary)" }}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          </svg>
          <span className="sidebar-brand-name">Doclo</span>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FaThLarge />
            <span>Dashboard</span>
          </button>
          <button 
            className={`menu-item ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            <FaCalendarAlt />
            <span>Appointments</span>
          </button>
          <button 
            className={`menu-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUserCircle />
            <span>Profile Details</span>
          </button>
          <button className="menu-item disabled-menu-item" title="Feature coming soon">
            <FaEnvelope />
            <span>Messages</span>
          </button>
          <button className="menu-item disabled-menu-item" title="Feature coming soon">
            <FaCreditCard />
            <span>Payments</span>
          </button>
          <button className="menu-item disabled-menu-item" title="Feature coming soon">
            <FaCog />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* 2. Main Dashboard Content Area */}
      <main className="doctor-main-content">
        {/* Top Header Section */}
        <header className="main-content-header">
          <div className="header-welcome">
            <h1>Welcome, {user?.name?.trim()?.startsWith("Dr.") ? user.name : `Dr. ${user?.name || "Doctor"}`}</h1>
            <p className="header-subtitle">Manage your patient consultation requests and schedule.</p>
          </div>
          
          <div className="header-actions">
            <div className="header-icon-badge" title="Help Desk">
              <FaRegQuestionCircle />
            </div>
            <div className="header-icon-badge animate-bell" title="Notifications">
              <FaBell />
              {pendingCount > 0 && <span className="notification-dot"></span>}
            </div>
            
            <div className="header-doctor-profile" onClick={() => setActiveTab("profile")}>
              <img 
                src={getImageUrl(profile?.profileImage)}
                alt={user?.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                }}
                className="header-doctor-avatar"
              />
              <div className="header-doctor-meta">
                <span className="doctor-name">{user?.name?.trim()?.startsWith("Dr.") ? user.name : `Dr. ${user?.name || "Doctor"}`}</span>
                <span className="doctor-spec">{profile?.specialization || "General Practitioner"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tabbed Layout Render */}
        <div className="dashboard-panel-container">
          {activeTab === "overview" && (
            <div className="overview-tab-content">
              {/* Row of 4 Stat Widgets */}
              <div className="dashboard-stats-grid">
                <div className="doc-stat-card">
                  <div className="stat-card-icon-wrapper patients">
                    <FaUserMd />
                  </div>
                  <div className="stat-card-data">
                    <h3>{completedCount + approvedCount}</h3>
                    <p>Total Patients</p>
                  </div>
                </div>

                <div className="doc-stat-card">
                  <div className="stat-card-icon-wrapper appointments">
                    <FaCalendarAlt />
                  </div>
                  <div className="stat-card-data">
                    <h3>{appointments.length}</h3>
                    <p>Appointments</p>
                  </div>
                </div>

                <div className="doc-stat-card">
                  <div className="stat-card-icon-wrapper consults">
                    <FaHospital />
                  </div>
                  <div className="stat-card-data">
                    <h3>{completedCount}</h3>
                    <p>Completed Consults</p>
                  </div>
                </div>

                 <div className="doc-stat-card">
                  <div className="stat-card-icon-wrapper revenue" style={{ background: "rgba(16, 185, 129, 0.08)", color: "#10B981" }}>
                    <FaRupeeSign />
                  </div>
                  <div className="stat-card-data">
                    <h3>₹{todayEarnings}</h3>
                    <p>Today's Earnings</p>
                  </div>
                </div>

                <div className="doc-stat-card">
                  <div className="stat-card-icon-wrapper revenue" style={{ background: "rgba(79, 70, 229, 0.08)", color: "#4F46E5" }}>
                    <FaRupeeSign />
                  </div>
                  <div className="stat-card-data">
                    <h3>₹{totalEarnings}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
              </div>

              {/* Grid content columns */}
              <div className="overview-layout-grid">
                {/* Left Side: SVG Chart + Table card */}
                <div className="grid-left-col">
                  {/* Patients Line Chart Card — Data-Driven */}
                  <div className="dashboard-widget-card line-chart-widget">
                    {(() => {
                      const chartData = buildChartData(appointments);
                      const allNewCount = chartData.reduce((s, d) => s + d.newCount, 0);
                      const allRetCount = chartData.reduce((s, d) => s + d.returningCount, 0);
                      const maxVal = Math.max(
                        ...chartData.map(d => d.newCount),
                        ...chartData.map(d => d.returningCount),
                        1
                      );
                      // SVG dimensions
                      const W = 500;
                      const H = 190;
                      const padL = 32;
                      const padR = 16;
                      const padTop = 15;
                      const padBot = 30;
                      const chartH = H - padTop - padBot;
                      const chartW = W - padL - padR;
                      const n = chartData.length;
                      const step = chartW / (n - 1);

                      const xOf = (i) => padL + i * step;
                      const yOf = (val) => padTop + chartH - Math.round((val / maxVal) * chartH);

                      // Y-axis grid values
                      const gridLines = [0, Math.round(maxVal / 2), maxVal];

                      // Build polyline points strings
                      const newPoints = chartData.map((d, i) => `${xOf(i)},${yOf(d.newCount)}`).join(" ");
                      const retPoints = chartData.map((d, i) => `${xOf(i)},${yOf(d.returningCount)}`).join(" ");

                      // Build filled area path (new patients)
                      const newAreaPath = `M ${chartData.map((d, i) => `${xOf(i)},${yOf(d.newCount)}`).join(" L ")} L ${xOf(n-1)},${padTop + chartH} L ${xOf(0)},${padTop + chartH} Z`;
                      const retAreaPath = `M ${chartData.map((d, i) => `${xOf(i)},${yOf(d.returningCount)}`).join(" L ")} L ${xOf(n-1)},${padTop + chartH} L ${xOf(0)},${padTop + chartH} Z`;

                      const hasAnyData = allNewCount + allRetCount > 0;

                      return (
                        <>
                          <div className="widget-header">
                            <h3>Patients Analytics</h3>
                            <div className="chart-legend">
                              <span className="legend-dot new"></span> New Patients ({allNewCount})
                              <span className="legend-dot old" style={{ marginLeft: 12 }}></span> Returning ({allRetCount})
                            </div>
                          </div>
                          <div className="widget-body chart-svg-container">
                            {!hasAnyData ? (
                              <div className="chart-empty-state">
                                <div className="chart-empty-icon">📊</div>
                                <p>No appointment data yet.</p>
                                <span>Data will appear once patients book consultations.</span>
                              </div>
                            ) : (
                              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: "visible" }}>
                                <defs>
                                  <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02"/>
                                  </linearGradient>
                                  <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2"/>
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02"/>
                                  </linearGradient>
                                </defs>

                                {/* Horizontal grid lines + Y labels */}
                                {gridLines.map((v, gi) => {
                                  const y = yOf(v);
                                  return (
                                    <g key={gi}>
                                      <line x1={padL} y1={y} x2={W - padR} y2={y}
                                        stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
                                      <text x={padL - 4} y={y + 4} textAnchor="end"
                                        fill="#94a3b8" fontSize="9" fontWeight="600">{v}</text>
                                    </g>
                                  );
                                })}

                                {/* Vertical day separator lines */}
                                {chartData.map((d, i) => (
                                  <line key={i} x1={xOf(i)} y1={padTop} x2={xOf(i)} y2={padTop + chartH}
                                    stroke="#f1f5f9" strokeWidth="1" />
                                ))}

                                {/* Filled areas */}
                                <path d={retAreaPath} fill="url(#retGrad)" />
                                <path d={newAreaPath} fill="url(#newGrad)" />

                                {/* Lines */}
                                <polyline points={retPoints} fill="none" stroke="#06b6d4" strokeWidth="2.5"
                                  strokeLinejoin="round" strokeLinecap="round" />
                                <polyline points={newPoints} fill="none" stroke="#10b981" strokeWidth="2.5"
                                  strokeLinejoin="round" strokeLinecap="round" />

                                {/* Data point dots with title tooltips */}
                                {chartData.map((d, i) => (
                                  <g key={i}>
                                    {/* Returning dot */}
                                    <circle cx={xOf(i)} cy={yOf(d.returningCount)} r="4"
                                      fill="#06b6d4" stroke="white" strokeWidth="2">
                                      <title>{d.label}: {d.returningCount} returning</title>
                                    </circle>
                                    {/* New dot */}
                                    <circle cx={xOf(i)} cy={yOf(d.newCount)} r="4"
                                      fill="#10b981" stroke="white" strokeWidth="2">
                                      <title>{d.label}: {d.newCount} new</title>
                                    </circle>
                                  </g>
                                ))}

                                {/* X-axis date labels */}
                                {chartData.map((d, i) => (
                                  <text key={i} x={xOf(i)} y={H - 4}
                                    textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
                                    {d.label}
                                  </text>
                                ))}
                              </svg>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Recent Patients Table Card */}
                  <div className="dashboard-widget-card table-widget">
                    <div className="widget-header">
                      <h3>Recent Patients Table</h3>
                      <button className="view-all-link" onClick={() => setActiveTab("appointments")}>View All &gt;</button>
                    </div>
                    <div className="widget-body">
                      {appointments.length > 0 ? (
                        <div className="table-responsive doc-table-scroll-container">
                          <table className="doc-custom-table">
                            <thead>
                              <tr>
                                <th>Patient Name</th>
                                <th>Reason / Disease</th>
                                <th>Scheduled Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {appointments.slice(0, 5).map((app) => (
                                <tr key={app._id}>
                                  <td>
                                    <div className="table-patient-profile">
                                      <div className="table-patient-avatar-placeholder">
                                        {app.patient?.name ? app.patient.name.charAt(0).toUpperCase() : "P"}
                                      </div>
                                      <div className="table-patient-info">
                                        <h4>{app.patient?.name}</h4>
                                        <p>{app.patient?.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="disease-badge">{app.reason}</span>
                                  </td>
                                  <td>
                                    <div className="date-time-meta">
                                      <span>{formatDate(app.appointmentDate)}</span>
                                      <span className="time-badge"><FaClock /> {app.appointmentTime}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`status-badge-custom ${app.status}`}>
                                      {app.status}
                                    </span>
                                  </td>
                                  <td>
                                    {app.status === "approved" && app.paymentStatus === "paid" && (
                                      <button className="table-action-action-btn" onClick={() => openPrescribeModal(app)}>
                                        Prescribe
                                      </button>
                                    )}
                                    {app.status === "completed" && (
                                      <button className="table-action-action-btn view-btn" onClick={() => openViewModal(app)}>
                                        View Rx
                                      </button>
                                    )}
                                    {app.status === "pending" && (
                                      <span className="table-action-na-text">Awaiting Accept</span>
                                    )}
                                    {app.status === "approved" && app.paymentStatus === "pending" && (
                                      <span className="table-action-na-text">Awaiting Pay</span>
                                    )}
                                    {app.status === "cancelled" && (
                                      <span className="table-action-na-text cancelled">Declined</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-widget-state">
                          <FaCalendarAlt />
                          <p>No recent patients.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Appointment Requests and Gender Chart */}
                <div className="grid-right-col">
                  {/* Appointment Request List (Pending) */}
                  <div className="dashboard-widget-card pending-requests-widget">
                    <div className="widget-header">
                      <h3>Appointment Requests</h3>
                      <span className="pending-badge-count">{pendingCount} New</span>
                    </div>
                    <div className="widget-body request-list-scrollbar">
                      {appointments.filter(app => app.status === "pending").length > 0 ? (
                        <div className="request-items-list">
                          {appointments.filter(app => app.status === "pending").map((app) => (
                            <div key={app._id} className="request-card-item">
                              <div className="request-user-meta">
                                <div className="request-avatar">
                                  {app.patient?.name ? app.patient.name.charAt(0).toUpperCase() : "P"}
                                </div>
                                <div className="request-text">
                                  <h4>{app.patient?.name}</h4>
                                  <p>{app.patient?.gender || "Gender: N/A"} • {app.patient?.dob ? calculateAge(app.patient.dob) + " Years" : "Age: N/A"}</p>
                                  <span className="request-time-span">📅 {formatDate(app.appointmentDate)} at {app.appointmentTime}</span>
                                </div>
                              </div>
                              <div className="request-action-controls">
                                <button 
                                  className="request-accept-btn"
                                  onClick={() => handleStatusChange(app._id, "approved")}
                                  title="Accept Appointment Request"
                                >
                                  ✔️
                                </button>
                                <button 
                                  className="request-decline-btn"
                                  onClick={() => handleStatusChange(app._id, "cancelled")}
                                  title="Decline Appointment Request"
                                >
                                  ❌
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-requests-state">
                          <div className="requests-check-circle">✔️</div>
                          <h4>No Pending Requests</h4>
                          <p>All patient consult schedules are currently reviewed and handled.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gender Distribution Doughnut Widget */}
                  <div className="dashboard-widget-card doughnut-chart-widget">
                    <div className="widget-header">
                      <h3>Gender Distribution</h3>
                    </div>
                    <div className="widget-body gender-chart-body">
                      {/* Custom circular SVG doughnut chart */}
                      <div className="doughnut-container">
                        <svg width="130" height="130" viewBox="0 0 36 36" className="circular-chart">
                          <defs>
                            <linearGradient id="maleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#4F46E5" />
                              <stop offset="100%" stopColor="#06B6D4" />
                            </linearGradient>
                            <linearGradient id="femaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#EC4899" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                            <linearGradient id="childGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#F59E0B" />
                              <stop offset="100%" stopColor="#D97706" />
                            </linearGradient>
                          </defs>
                          <path className="circle-bg"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#F1F5F9"
                            strokeWidth="3.2"
                          />
                          {/* Segment Male: dynamic */}
                          <path className="circle-segment male"
                            strokeDasharray={`${malePct}, 100`}
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#maleGrad)"
                            strokeWidth="3.2"
                            strokeDashoffset="0"
                          />
                          {/* Segment Female: dynamic */}
                          <path className="circle-segment female"
                            strokeDasharray={`${femalePct}, 100`}
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#femaleGrad)"
                            strokeWidth="3.2"
                            strokeDashoffset={`-${malePct}`}
                          />
                          {/* Segment Child: dynamic */}
                          <path className="circle-segment child"
                            strokeDasharray={`${childPct}, 100`}
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#childGrad)"
                            strokeWidth="3.2"
                            strokeDashoffset={`-${malePct + femalePct}`}
                          />
                        </svg>
                        <div className="doughnut-center-text">
                          <span className="percent">
                            {[...new Set(appointments.map(a => a.patient?._id || a.patient?.id || a.patient))].filter(Boolean).length}
                          </span>
                          <span className="label">Patients</span>
                        </div>
                      </div>

                      <div className="gender-legends">
                        <div className="legend-row">
                          <div className="legend-row-meta">
                            <span className="dot male"></span>
                            <FaMars className="gender-icon male" />
                            <span className="label">Male</span>
                            <span className="value">{malePct}%</span>
                          </div>
                          <div className="legend-progress-bar">
                            <div className="legend-progress-fill male" style={{ width: `${malePct}%` }}></div>
                          </div>
                        </div>

                        <div className="legend-row">
                          <div className="legend-row-meta">
                            <span className="dot female"></span>
                            <FaVenus className="gender-icon female" />
                            <span className="label">Female</span>
                            <span className="value">{femalePct}%</span>
                          </div>
                          <div className="legend-progress-bar">
                            <div className="legend-progress-fill female" style={{ width: `${femalePct}%` }}></div>
                          </div>
                        </div>

                        <div className="legend-row">
                          <div className="legend-row-meta">
                            <span className="dot child"></span>
                            <FaBaby className="gender-icon child" />
                            <span className="label">Child</span>
                            <span className="value">{childPct}%</span>
                          </div>
                          <div className="legend-progress-bar">
                            <div className="legend-progress-fill child" style={{ width: `${childPct}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="appointments-tab-content">
              {/* Full view of all appointments */}
              <div className="dashboard-widget-card table-widget full-width-widget">
                <div className="widget-header">
                  <h3>All Patient Appointments Log</h3>
                </div>
                <div className="widget-body">
                  {appointments.length > 0 ? (
                    <div className="table-responsive">
                      <table className="doc-custom-table">
                        <thead>
                          <tr>
                            <th>Patient Info</th>
                            <th>Visit Reason</th>
                            <th>Scheduled Date</th>
                            <th>Status Details</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((app) => (
                            <tr key={app._id}>
                              <td>
                                <div className="table-patient-profile">
                                  {renderPatientAvatar(app.patient)}
                                  <div className="table-patient-info">
                                    <h4>{app.patient?.name || "Patient"}</h4>
                                    <p>{app.patient?.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="disease-badge">{app.reason}</span>
                              </td>
                              <td>
                                <div className="date-time-meta">
                                  <span>{formatDate(app.appointmentDate)}</span>
                                  <span className="time-badge"><FaClock /> {app.appointmentTime}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                  <span className={`status-badge-custom ${app.status}`}>
                                    <span className="status-dot"></span>
                                    {app.status}
                                  </span>
                                  {app.paymentStatus === "paid" ? (
                                    <span className="payment-status-badge paid">Paid</span>
                                  ) : (
                                    <span className="payment-status-badge unpaid">Unpaid</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {app.status === "pending" ? (
                                  <div className="table-buttons-group" style={{ display: "flex", gap: "8px" }}>
                                    <button className="table-action-action-btn accept" style={{ background: "#10B981" }} onClick={() => handleStatusChange(app._id, "approved")}>Accept</button>
                                    <button className="table-action-action-btn decline" style={{ background: "#FEE2E2", color: "#DC2626" }} onClick={() => handleStatusChange(app._id, "cancelled")}>Decline</button>
                                  </div>
                                ) : app.status === "approved" && app.paymentStatus === "paid" ? (
                                  <button className="table-action-action-btn" onClick={() => openPrescribeModal(app)}>
                                    Complete & Prescribe
                                  </button>
                                ) : app.status === "completed" ? (
                                  <button className="table-action-action-btn view-btn" onClick={() => openViewModal(app)}>
                                    View Rx
                                  </button>
                                ) : app.status === "approved" && app.paymentStatus === "pending" ? (
                                  <span className="table-action-na-text">Awaiting Payment</span>
                                ) : (
                                  <span className="table-action-na-text cancelled">Closed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-widget-state">
                      <FaCalendarAlt />
                      <p>No appointments logs found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="profile-tab-content">
              {/* Profile Credentials Setup Form Card */}
              <div className="dashboard-widget-card form-panel-widget">
                <div className="widget-header">
                  <h3>Professional Medical Profile Details</h3>
                </div>
                <div className="widget-body">
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

                  <div className="profile-photo-upload-section">
                    <div className="avatar-upload-placeholder">
                      <img
                        src={profile?.profileImage ? `http://localhost:5000${profile.profileImage}` : `http://localhost:5000/uploads/default-doctor.png`}
                        alt={user?.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                        }}
                      />
                    </div>
                    <label className="sidebar-upload-photo-btn">
                      <FaCamera style={{ marginRight: "6px" }} /> Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="doctor-profile-form">
                    <div className="form-fields-grid">
                      <div className="input-group">
                        <label htmlFor="specialization">Specialization</label>
                        <div className="input-field-wrapper select-wrapper">
                          <select
                            id="specialization"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
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

                      <div className="input-group">
                        <label htmlFor="qualification">Qualification</label>
                        <div className="input-field-wrapper">
                          <input
                            type="text"
                            id="qualification"
                            name="qualification"
                            placeholder="MBBS, MD"
                            value={formData.qualification}
                            onChange={handleInputChange}
                            required
                          />
                          <FaGraduationCap className="input-field-icon" />
                        </div>
                      </div>

                      <div className="input-group" ref={suggestionDropdownRef} style={{ position: "relative" }}>
                        <label htmlFor="hospital">Hospital / Clinic Search</label>
                        <div className="input-field-wrapper">
                          <input
                            type="text"
                            id="hospital"
                            name="hospital"
                            placeholder="Type to search real hospitals..."
                            value={formData.hospital}
                            onChange={handleInputChange}
                            required
                            autoComplete="off"
                          />
                          <FaHospital className="input-field-icon" />
                        </div>

                        {showHospSuggestions && (
                          <div className="suggestions-dropdown" style={{ top: "72px" }}>
                            {hospSuggestions.map((hosp, i) => (
                              <div 
                                key={i} 
                                className="suggestion-item"
                                onClick={() => handleHospitalSelect(hosp)}
                              >
                                <div>
                                  <span className="suggestion-name" style={{ fontSize: "13.5px" }}>
                                    {hosp.display_name.split(",")[0]}
                                  </span>
                                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                                    {hosp.display_name.split(",").slice(1, 4).join(",")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="input-group">
                        <label htmlFor="address">Full Address / Location</label>
                        <div className="input-field-wrapper">
                          <input
                            type="text"
                            id="address"
                            name="address"
                            placeholder="123 Hospital Street, City"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                          <FaMapMarkerAlt className="input-field-icon" />
                        </div>
                      </div>

                      <div className="input-group">
                        <label htmlFor="experience">Years of Experience</label>
                        <div className="input-field-wrapper">
                          <input
                            type="number"
                            id="experience"
                            name="experience"
                            placeholder="8"
                            value={formData.experience}
                            onChange={handleInputChange}
                            required
                          />
                          <FaRegClock className="input-field-icon" />
                        </div>
                      </div>

                      <div className="input-group">
                        <label htmlFor="consultationFee">Consultation Fee (₹)</label>
                        <div className="input-field-wrapper">
                          <input
                            type="number"
                            id="consultationFee"
                            name="consultationFee"
                            placeholder="500"
                            value={formData.consultationFee}
                            onChange={handleInputChange}
                            required
                          />
                          <FaRupeeSign className="input-field-icon" />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={profileLoading} style={{ marginTop: "24px" }}>
                      {profileLoading ? "Saving Profile..." : "Save Professional Details"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Complete & Prescribe Modal */}
      {isPrescribeModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h3>Complete Consultation & Prescribe</h3>
              <button className="close-modal-btn" onClick={() => setIsPrescribeModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handlePrescriptionSubmit}>
              <div className="custom-modal-body">
                <div className="patient-summary-info">
                  <p><strong>Patient Name:</strong> {selectedAppointment?.patient?.name}</p>
                  <p><strong>Email:</strong> {selectedAppointment?.patient?.email}</p>
                  <p><strong>Date & Time:</strong> {formatDate(selectedAppointment?.appointmentDate)} ({selectedAppointment?.appointmentTime})</p>
                  <p><strong>Reason for Visit:</strong> {selectedAppointment?.reason}</p>
                </div>
                <div className="input-group" style={{ marginTop: "16px" }}>
                  <label htmlFor="prescription">Prescription / Medical Advice</label>
                  <textarea
                    id="prescription"
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                    placeholder="Enter medications, dosage, instructions, and follow-up advice..."
                    required
                    rows="6"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1.5px solid var(--border-light)",
                      fontFamily: "inherit",
                      fontSize: "14.5px",
                      resize: "vertical",
                      marginTop: "8px"
                    }}
                  />
                </div>
              </div>
              <div className="custom-modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsPrescribeModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="approve-btn" disabled={modalSubmitLoading}>
                  {modalSubmitLoading ? "Saving..." : "Submit & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {isViewModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h3>Prescription Details</h3>
              <button className="close-modal-btn" onClick={() => setIsViewModalOpen(false)}>&times;</button>
            </div>
            <div className="custom-modal-body">
              <div className="patient-summary-info">
                <p><strong>Patient Name:</strong> {selectedAppointment?.patient?.name}</p>
                <p><strong>Email:</strong> {selectedAppointment?.patient?.email}</p>
                <p><strong>Date:</strong> {formatDate(selectedAppointment?.appointmentDate)}</p>
                <p><strong>Time:</strong> {selectedAppointment?.appointmentTime}</p>
                <p><strong>Reason for Visit:</strong> {selectedAppointment?.reason}</p>
              </div>
              <div style={{ marginTop: "20px", padding: "16px", background: "var(--bg-main)", borderRadius: "16px", border: "1px solid var(--border-light)" }}>
                <h4 style={{ margin: "0 0 10px", color: "var(--dark-navy)" }}>Rx / Medical Instructions:</h4>
                <p style={{ margin: 0, whiteSpace: "pre-line", fontSize: "14.5px", lineHeight: "1.6", color: "var(--text-main)" }}>
                  {selectedAppointment?.prescription || "No prescription details provided."}
                </p>
              </div>
            </div>
            <div className="custom-modal-footer">
              <button type="button" className="approve-btn" onClick={() => setIsViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;