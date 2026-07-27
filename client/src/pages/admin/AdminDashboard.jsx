import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { getAllDoctors, approveDoctor, deleteDoctor } from "../../services/doctorService";
import { getAllPatients, deletePatient } from "../../services/authService";
import { getAllAppointments, deleteAppointment } from "../../services/appointmentService";
import { FaUserMd, FaCheck, FaTimes, FaTrash, FaCheckCircle, FaExclamationTriangle, FaHourglassHalf, FaUsers, FaUserCheck, FaUserClock, FaShieldAlt, FaCalendarAlt, FaSearch, FaRupeeSign } from "react-icons/fa";
import "./AdminDashboard.css";
import "../patient/PatientDashboard.css"; // Reuse table styles

const PAGE_SIZE = 5;

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [docsData, patientsData, apptsData] = await Promise.all([
          getAllDoctors({ adminMode: true }),
          getAllPatients(),
          getAllAppointments()
        ]);
        setDoctors(docsData);
        setPatients(patientsData);
        setAppointments(apptsData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch administrator data registries.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [user, navigate, refreshTrigger]);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 4500);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await approveDoctor(id, newStatus);
      showToast(`Doctor verification status updated successfully!`, "success");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
      showToast("Failed to update doctor verification status.", "error");
    }
  };

  const handleDelete = async (id, isApproved) => {
    const confirmMessage = isApproved 
      ? "Are you sure you want to permanently delete this doctor profile? This action cannot be undone."
      : "Are you sure you want to reject and delete this doctor's registration request? This action cannot be undone.";
    if (!window.confirm(confirmMessage)) {
      return;
    }
    try {
      await deleteDoctor(id);
      showToast(isApproved ? "Doctor profile deleted successfully!" : "Doctor registration request rejected and deleted.", "success");
      setRefreshTrigger(prev => prev + 1);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showToast(isApproved ? "Failed to delete doctor profile." : "Failed to reject doctor registration request.", "error");
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this patient account? This will also remove all their scheduled appointments.")) {
      return;
    }
    try {
      await deletePatient(id);
      showToast("Patient profile and associated appointments deleted successfully!", "success");
      setRefreshTrigger(prev => prev + 1);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete patient account.", "error");
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to remove this appointment record from the registry?")) {
      return;
    }
    try {
      await deleteAppointment(id);
      showToast("Appointment record removed successfully!", "success");
      setRefreshTrigger(prev => prev + 1);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showToast("Failed to remove appointment record.", "error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDoctorDailyStats = (docId) => {
    const todayStr = getTodayDateString();
    
    // Filter paid appointments for this doctor on the current date
    const docTodayPaid = appointments.filter(app => 
      app.doctor && 
      (app.doctor._id === docId || app.doctor === docId) && 
      app.appointmentDate === todayStr && 
      app.paymentStatus === "paid"
    );
    
    // Filter all time paid appointments for this doctor
    const docAllTimePaid = appointments.filter(app => 
      app.doctor && 
      (app.doctor._id === docId || app.doctor === docId) && 
      app.paymentStatus === "paid"
    );
    
    const todayEarnings = docTodayPaid.reduce((sum, app) => sum + (app.amount || 0), 0);
    const totalEarnings = docAllTimePaid.reduce((sum, app) => sum + (app.amount || 0), 0);
    
    return {
      todayCount: docTodayPaid.length,
      todayEarnings,
      totalEarnings
    };
  };

  // Stats Computation
  const verifiedDoctorsCount = doctors.filter(d => d.isApproved).length;
  const pendingDoctors = doctors.filter(d => !d.isApproved).length;
  
  const todayStr = getTodayDateString();
  const todayAppointments = appointments.filter(app => app.appointmentDate === todayStr && app.paymentStatus === "paid");
  const todayTotalEarnings = todayAppointments.reduce((sum, app) => sum + (app.amount || 0), 0);

  // Filtering and Search Math
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase().trim();
    if (activeTab === "doctors") {
      return doctors.filter(d => d.isApproved).filter(d => 
        (d.user?.name || "").toLowerCase().includes(query) ||
        (d.specialization || "").toLowerCase().includes(query) ||
        (d.hospital || "").toLowerCase().includes(query)
      );
    } else if (activeTab === "requests") {
      return doctors.filter(d => !d.isApproved).filter(d => 
        (d.user?.name || "").toLowerCase().includes(query) ||
        (d.specialization || "").toLowerCase().includes(query) ||
        (d.hospital || "").toLowerCase().includes(query)
      );
    } else if (activeTab === "patients") {
      return patients.filter(p => 
        (p.name || "").toLowerCase().includes(query) ||
        (p.email || "").toLowerCase().includes(query)
      );
    } else if (activeTab === "earnings") {
      return doctors.filter(d => d.isApproved).filter(d => 
        (d.user?.name || "").toLowerCase().includes(query) ||
        (d.specialization || "").toLowerCase().includes(query)
      );
    } else {
      return appointments.filter(a => 
        (a.patient?.name || "").toLowerCase().includes(query) ||
        (a.doctor?.user?.name || "").toLowerCase().includes(query) ||
        (a.reason || "").toLowerCase().includes(query)
      );
    }
  };

  const filteredData = getFilteredData();
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const paginatedItems = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="admin-dashboard">
      <Navbar />

      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="hero-text-side">
            <span className="hero-badge">
              <FaShieldAlt /> System Administrator
            </span>
            <h1>Admin Control Panel</h1>
            <p>Verify doctor medical credentials, monitor patient directories, manage registrations, and override scheduling databases.</p>
          </div>
          
          <div className="hero-stats-side">
            <div className="stats-grid-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", width: "100%" }}>
              <div className="hero-stat-mini-card">
                <div className="stat-icon-container approved">
                  <FaUserMd />
                </div>
                <div className="stat-text-container">
                  <span className="stat-number">{verifiedDoctorsCount}</span>
                  <span className="stat-label">Verified Doctors</span>
                </div>
              </div>
              
              <div className="hero-stat-mini-card">
                <div className="stat-icon-container completed">
                  <FaUsers />
                </div>
                <div className="stat-text-container">
                  <span className="stat-number">{patients.length}</span>
                  <span className="stat-label">Patients</span>
                </div>
              </div>
              
              <div className="hero-stat-mini-card">
                <div className="stat-icon-container pending">
                  <FaCalendarAlt />
                </div>
                <div className="stat-text-container">
                  <span className="stat-number">{appointments.length}</span>
                  <span className="stat-label">Appointments</span>
                </div>
              </div>

              <div className="hero-stat-mini-card">
                <div className="stat-icon-container approved" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <FaRupeeSign />
                </div>
                <div className="stat-text-container">
                  <span className="stat-number">₹{todayTotalEarnings}</span>
                  <span className="stat-label">Today's Earnings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="admin-grid">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className={toastType === "success" ? "success-message" : "error-message"} style={{ margin: 0 }}>
            {toastType === "success" ? <FaCheckCircle style={{ flexShrink: 0 }} /> : <FaExclamationTriangle style={{ flexShrink: 0 }} />}
            <span>{toastMessage}</span>
          </div>
        )}

        {error && (
          <div className="error-message" style={{ margin: 0 }}>
            <FaExclamationTriangle style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Tabs and Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap", width: "100%" }}>
          <div className="admin-tabs-nav">
            <button className={`admin-tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => { setActiveTab('doctors'); setCurrentPage(1); setSearchQuery(''); }}>
              <FaUserCheck /> Verified Doctors
            </button>
            <button className={`admin-tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => { setActiveTab('requests'); setCurrentPage(1); setSearchQuery(''); }}>
              <FaUserClock /> Verification Requests ({pendingDoctors})
            </button>
            <button className={`admin-tab-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => { setActiveTab('patients'); setCurrentPage(1); setSearchQuery(''); }}>
              <FaUsers /> Patients
            </button>
            <button className={`admin-tab-btn ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => { setActiveTab('earnings'); setCurrentPage(1); setSearchQuery(''); }}>
              <FaRupeeSign /> Daily Doctor Earnings
            </button>
            <button className={`admin-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => { setActiveTab('appointments'); setCurrentPage(1); setSearchQuery(''); }}>
              <FaCalendarAlt /> Appointments
            </button>
          </div>

          <div className="admin-search-wrapper">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
            <FaSearch className="admin-search-icon" />
          </div>
        </div>

        {/* Dynamic Directory Tables */}
        {loading ? (
          <div className="appointments-table-card">
            <div className="table-responsive">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Loading Details</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      <td>
                        <div className="skeleton-text" style={{ width: "100%", height: "24px" }}></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : paginatedItems.length > 0 ? (
          <>
            <div className="appointments-table-card">
              <div className="table-responsive">
                <table className="appointments-table">
                  {(activeTab === "doctors" || activeTab === "requests") && (
                    <>
                      <thead>
                        <tr>
                          <th>Doctor</th>
                          <th>Hospital</th>
                          <th>Degree Document</th>
                          <th>Consultation Fee</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((doctor) => (
                          <tr key={doctor._id}>
                            <td>
                              <div className="doc-table-meta">
                                <img
                                  src={doctor.profileImage ? `http://localhost:5000${doctor.profileImage}` : `http://localhost:5000/uploads/default-doctor.png`}
                                  alt={doctor.user?.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                                  }}
                                />
                                <div>
                                  <h4 style={{ fontWeight: 700, color: "var(--dark-navy)" }}>{doctor.user?.name || "Doctor"}</h4>
                                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0" }}>{doctor.user?.email}</p>
                                  <p style={{ fontSize: "11px", color: "var(--primary)" }}>{doctor.specialization} - {doctor.qualification}</p>
                                </div>
                              </div>
                            </td>
                            <td>{doctor.hospital}</td>
                            <td>
                              {doctor.degree ? (
                                <a
                                  href={`http://localhost:5000${doctor.degree}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="view-degree-link"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "13px",
                                    fontWeight: "650",
                                    color: "#1A73E8",
                                    textDecoration: "none",
                                    padding: "6px 12px",
                                    background: "rgba(26, 115, 232, 0.06)",
                                    border: "1px solid rgba(26, 115, 232, 0.15)",
                                    borderRadius: "8px",
                                    transition: "all 0.2s ease"
                                  }}
                                >
                                  View Degree
                                </a>
                              ) : (
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic" }}>Not Uploaded</span>
                              )}
                            </td>
                            <td style={{ fontWeight: 700 }}>₹{doctor.consultationFee}</td>
                            <td>
                              {doctor.isApproved ? (
                                <span className="status-badge approved">
                                  <FaCheckCircle style={{ marginRight: "4px" }} /> Verified
                                </span>
                              ) : (
                                <span className="status-badge pending">
                                  <FaHourglassHalf style={{ marginRight: "4px" }} /> Pending Approval
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="action-btn-group">
                                {doctor.isApproved ? (
                                  <>
                                    <button
                                      className="admin-action-btn decline"
                                      onClick={() => handleStatusToggle(doctor._id, doctor.isApproved)}
                                    >
                                      <FaTimes /> Decline Approval
                                    </button>
                                    <button
                                      className="admin-action-btn delete"
                                      onClick={() => handleDelete(doctor._id, doctor.isApproved)}
                                    >
                                      <FaTrash /> Delete
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      className="admin-action-btn approve"
                                      onClick={() => handleStatusToggle(doctor._id, doctor.isApproved)}
                                    >
                                      <FaCheck /> Approve Doctor
                                    </button>
                                    <button
                                      className="admin-action-btn delete"
                                      onClick={() => handleDelete(doctor._id, doctor.isApproved)}
                                    >
                                      <FaTimes /> Reject Doctor
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {activeTab === "patients" && (
                    <>
                      <thead>
                        <tr>
                          <th>Patient Info</th>
                          <th>Registered Date</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((patient) => (
                          <tr key={patient._id}>
                            <td>
                              <div className="doc-table-meta">
                                <img
                                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                                  alt={patient.name}
                                  style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
                                />
                                <div>
                                  <h4 style={{ fontWeight: 700, color: "var(--dark-navy)" }}>{patient.name || "Patient"}</h4>
                                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{patient.email}</p>
                                </div>
                              </div>
                            </td>
                            <td>{formatDate(patient.createdAt)}</td>
                            <td>
                              <span className="status-badge approved" style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--primary)" }}>
                                {patient.role}
                              </span>
                            </td>
                            <td>
                              <button
                                className="admin-action-btn delete"
                                onClick={() => handleDeletePatient(patient._id)}
                              >
                                <FaTrash /> Delete Account
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {activeTab === "appointments" && (
                    <>
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Scheduled Slot</th>
                          <th>Payment</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((app) => (
                          <tr key={app._id}>
                            <td>
                              <h4 style={{ fontWeight: 750, color: "var(--dark-navy)" }}>{app.patient?.name || "Patient"}</h4>
                              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{app.patient?.email}</p>
                            </td>
                            <td>
                              <h4 style={{ fontWeight: 750, color: "var(--dark-navy)" }}>{app.doctor?.user?.name || "Doctor"}</h4>
                              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{app.doctor?.specialization}</p>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontWeight: 650 }}>{formatDate(app.appointmentDate)}</span>
                                <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{app.appointmentTime}</span>
                              </div>
                            </td>
                            <td>
                              {app.paymentStatus === "paid" ? (
                                <span className="payment-badge paid">Paid</span>
                              ) : (
                                <span className="payment-badge unpaid">Unpaid</span>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge ${app.status}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="admin-action-btn delete"
                                onClick={() => handleDeleteAppointment(app._id)}
                              >
                                <FaTrash /> Delete Record
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {activeTab === "earnings" && (
                    <>
                      <thead>
                        <tr>
                          <th>Doctor Profile</th>
                          <th>Today's Consultations</th>
                          <th>Today's Earnings</th>
                          <th>Total All-Time Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((doctor) => {
                          const stats = getDoctorDailyStats(doctor._id);
                          return (
                            <tr key={doctor._id}>
                              <td>
                                <div className="doc-table-meta">
                                  <img
                                    src={doctor.profileImage ? `http://localhost:5000${doctor.profileImage}` : `http://localhost:5000/uploads/default-doctor.png`}
                                    alt={doctor.user?.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                                    }}
                                  />
                                  <div>
                                    <h4 style={{ fontWeight: 700, color: "var(--dark-navy)" }}>{doctor.user?.name || "Doctor"}</h4>
                                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0" }}>{doctor.user?.email}</p>
                                    <p style={{ fontSize: "11px", color: "var(--primary)" }}>{doctor.specialization}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontWeight: 700, color: stats.todayCount > 0 ? "var(--primary)" : "var(--text-secondary)" }}>
                                {stats.todayCount} visits
                              </td>
                              <td style={{ fontWeight: 800, color: stats.todayEarnings > 0 ? "#10B981" : "var(--text-secondary)" }}>
                                ₹{stats.todayEarnings}
                              </td>
                              <td style={{ fontWeight: 800, color: "var(--dark-navy)" }}>
                                ₹{stats.totalEarnings}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-appointments-card">
            <FaUserMd className="no-appointments-icon" />
            <h3>No Records Found</h3>
            <p>We couldn't find any profiles matching your search parameters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
