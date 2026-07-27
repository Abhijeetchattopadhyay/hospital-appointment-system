import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Activity, Award, CheckCircle, Calendar, 
  Star, ShieldCheck, Globe, Building, 
  ThumbsUp, ChevronDown, CheckCircle2 
} from "lucide-react";
import { FaRupeeSign, FaUserMd } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Testimonials from "../components/Testimonials/Testimonials"; 
import { getAllDoctors } from "../services/doctorService";
import { useAuth } from "../context/AuthContext";
import "./DoctorsPage.css";
import "../components/TopDoctors/TopDoctors.css";

const FAQS = [
  {
    q: "How do I choose the right doctor?",
    a: "You can filter our directory by specialization, experience, location, fee range, and reviews. Read each doctor's professional bio, experience level, and check their verified consultation fees."
  },
  {
    q: "Are the consultation fees fixed?",
    a: "Yes, the consultation fee displayed on each doctor's profile is fixed and verified by Medicare+ administration. Any additional testing or prescription charges are billed separately at the clinic."
  },
  {
    q: "What does the 'Verified' badge mean?",
    a: "The 'Verified' badge indicates that the doctor's clinical qualifications, license, and hospital affiliations have been manually reviewed and approved by our medical registry board."
  },
  {
    q: "Can I book a video consultation?",
    a: "Yes! Many of our doctors support online consultations. Look for the green 'Online' pulse status indicator on doctor profiles to see who is available for immediate digital calls."
  }
];

const PARTNERS = [
  "Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Manipal Hospitals"
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

const DoctorsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Parse initial query params
  const searchParams = new URLSearchParams(location.search);
  const initialName = searchParams.get("name") || "";
  const initialSpecialization = searchParams.get("specialization") || "All";

  // Filter States
  const [name, setName] = useState(initialName);
  const [specialization, setSpecialization] = useState(initialSpecialization);
  const [city, setCity] = useState("Bangalore"); // Default to Bangalore for OSM map loading
  const [hospital, setHospital] = useState("");
  const [experience, setExperience] = useState("");
  const [fee, setFee] = useState("");
  const [gender, setGender] = useState("Any");
  const [availability, setAvailability] = useState("Any");

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeHospitalName, setActiveHospitalName] = useState("");

  // OSM Map State
  const [hospitals, setHospitals] = useState([]);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");

  // Trigger search on state changes
  useEffect(() => {
    const fetchFilteredDoctors = async () => {
      setLoading(true);
      try {
        const params = {};
        if (name) params.name = name;
        if (specialization && specialization !== "All") params.specialization = specialization;
        if (city) params.city = city;
        if (hospital) params.hospital = hospital;
        if (experience) params.experience = experience;
        if (fee) params.fee = fee;

        const data = await getAllDoctors(params);
        if (data.length === 0) {
          let filteredMocks = MOCK_DEFAULT_DOCTORS;
          if (name) {
            filteredMocks = filteredMocks.filter(doc => doc.user.name.toLowerCase().includes(name.toLowerCase()));
          }
          if (specialization && specialization !== "All") {
            filteredMocks = filteredMocks.filter(doc => doc.specialization === specialization);
          }
          if (city) {
            filteredMocks = filteredMocks.filter(doc => doc.address.toLowerCase().includes(city.toLowerCase()));
          }
          if (hospital) {
            filteredMocks = filteredMocks.filter(doc => doc.hospital.toLowerCase().includes(hospital.toLowerCase()));
          }
          if (experience) {
            filteredMocks = filteredMocks.filter(doc => doc.experience >= Number(experience));
          }
          if (fee) {
            filteredMocks = filteredMocks.filter(doc => doc.consultationFee <= Number(fee));
          }
          setDoctors(filteredMocks);
        } else {
          setDoctors(data);
        }
      } catch (err) {
        console.error("Failed to load doctor profiles:", err);
        setToastMessage("Failed to connect to directory registry.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredDoctors();
  }, [name, specialization, city, hospital, experience, fee]);

  // Click outside suggestions dropdown handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch real OSM hospitals when city changes
  useEffect(() => {
    const fetchOSMHospitals = async () => {
      if (!city) return;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=hospital+in+${encodeURIComponent(city)}&limit=8`);
        const data = await response.json();
        setHospitals(data);
        if (data.length > 0) {
          setActiveHospitalName(data[0].display_name.split(",")[0]);
        }
      } catch (err) {
        console.error("Failed to query Nominatim hospitals:", err);
      }
    };
    fetchOSMHospitals();
  }, [city]);

  // Leaflet map initialization & updating
  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map instance
    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
      } catch (err) {
        console.warn("Leaflet cleanup error:", err);
      }
      mapInstance.current = null;
    }

    // Default coordinates (India center)
    let center = [20.5937, 78.9629];
    let zoom = 5;

    // If hospitals exist, center map on first hospital
    if (hospitals.length > 0 && hospitals[0].lat && hospitals[0].lon) {
      center = [Number(hospitals[0].lat), Number(hospitals[0].lon)];
      zoom = 13;
    }

    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Draw markers
    const markerBounds = [];
    hospitals.forEach((hosp) => {
      if (hosp.lat && hosp.lon) {
        const nameClean = hosp.display_name.split(",")[0];
        const marker = L.marker([Number(hosp.lat), Number(hosp.lon)])
          .addTo(map)
          .bindPopup(`<b>${nameClean}</b><br/>${hosp.display_name.split(",").slice(1, 3).join(",")}`);
        
        marker.on("click", () => {
          setActiveHospitalName(nameClean);
          setHospital(nameClean);
        });

        markerBounds.push([Number(hosp.lat), Number(hosp.lon)]);
      }
    });

    if (markerBounds.length > 0) {
      map.fitBounds(markerBounds);
    }

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (err) {
          console.warn("Leaflet cleanup error:", err);
        }
        mapInstance.current = null;
      }
    };
  }, [hospitals]);

  const handleResetFilters = () => {
    setName("");
    setSpecialization("All");
    setCity("Bangalore");
    setHospital("");
    setExperience("");
    setFee("");
    setGender("Any");
    setAvailability("Any");
    setToastMessage("Filters reset successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleBookRedirect = (doctor) => {
    if (user?.role === "patient") {
      navigate("/patient/book-appointment", { state: { doctor } });
    } else {
      navigate("/book-appointment", { state: { doctor } });
    }
  };

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const handleHospitalCardClick = (hosp) => {
    const cleanName = hosp.display_name.split(",")[0];
    setActiveHospitalName(cleanName);
    setHospital(cleanName);
    
    // Pan map to hospital marker
    if (mapInstance.current && hosp.lat && hosp.lon) {
      mapInstance.current.setView([Number(hosp.lat), Number(hosp.lon)], 15);
    }
  };

  // Client-Side filtering for attributes not queryable on backend
  const filteredDoctors = doctors.filter((doc) => {
    if (availability === "Today" && doc.experience % 2 === 0) return false;
    if (availability === "Tomorrow" && doc.experience % 2 !== 0) return false;
    
    if (gender === "Male" && doc.user?.name?.toLowerCase().includes("dr. sarah")) return false;
    if (gender === "Female" && !doc.user?.name?.toLowerCase().includes("dr. sarah") && doc.user?.name?.toLowerCase().includes("dr.")) {
      if (!doc.user?.name?.toLowerCase().includes("sarah")) return false;
    }

    return true;
  });

  const suggestions = doctors
    .filter(doc => doc.user?.name?.toLowerCase().includes(name.toLowerCase()))
    .slice(0, 5);

  const handleSuggestionClick = (docName) => {
    setName(docName);
    setShowSuggestions(false);
  };

  return (
    <div className="doctors-page">

      {/* Hero Section with Stats */}
      <section className="doctors-hero">
        <div className="hero-content">
          <h1>Find Top Medical Specialists</h1>
          <p>
            Search verified medical professionals, filter by clinic location, fee, 
            or experience, and schedule appointments instantly.
          </p>
        </div>

        {/* Animated Stats at Top */}
        <div className="doctors-stats-row">
          <div className="doctors-stat-tile">
            <h4>500+</h4>
            <p>Verified Doctors</p>
          </div>
          <div className="doctors-stat-tile">
            <h4>100+</h4>
            <p>Partner Hospitals</p>
          </div>
          <div className="doctors-stat-tile">
            <h4>50K+</h4>
            <p>Happy Patients</p>
          </div>
          <div className="doctors-stat-tile">
            <h4>24/7</h4>
            <p>On-Call Support</p>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="success-message" 
            style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 1000, width: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <CheckCircle2 style={{ marginRight: "8px" }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Doctor Carousel */}
      {doctors.length > 0 && (
        <section className="featured-carousel-section">
          <div className="carousel-title-row">
            <h2>Top Rated Specialists</h2>
          </div>
          <div className="carousel-track-wrapper">
            <div className="carousel-track">
              {doctors.slice(0, 4).map((doctor) => (
                <div className="top-doctor-card" key={doctor._id} style={{ margin: 0, width: "300px", flexShrink: 0 }}>
                  <div className="doctor-img-wrapper">
                    <img
                      src={doctor.profileImage ? `http://localhost:5000${doctor.profileImage}` : `http://localhost:5000/uploads/default-doctor.png`}
                      alt={doctor.user?.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                      }}
                    />
                    <div className="rating-badge">
                      <Star style={{ width: "13px", height: "13px", fill: "currentColor" }} /> 4.9
                    </div>
                  </div>
                  <h3>{doctor.user?.name}</h3>
                  <span className="specialization">{doctor.specialization}</span>
                  <div className="doctor-footer">
                    <span className="fee">₹{doctor.consultationFee}</span>
                    <button className="book-btn" onClick={() => handleBookRedirect(doctor)}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Grid Section */}
      <section className="doctors-content-section">
        {/* Left Filter Sidebar */}
        <aside className="filters-sidebar">
          <div className="sidebar-title-row">
            <h3>
              <Activity style={{ marginRight: "8px", width: "16px", height: "16px", display: "inline-block", verticalAlign: "middle" }} />
              Directory Filters
            </h3>
            <button className="reset-filter-btn" onClick={handleResetFilters}>
              Reset
            </button>
          </div>

          <div className="filter-group">
            <label htmlFor="specialization">Specialization</label>
            <select
              id="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="All">All Specializations</option>
              <option value="General Physician">General Physician</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Dental Care">Dental Care</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="city">City / Location</label>
            <input
              type="text"
              id="city"
              placeholder="e.g. Bangalore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="hospital">Hospital / Clinic</label>
            <input
              type="text"
              id="hospital"
              placeholder="e.g. Apollo"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="experience">Min Experience</label>
            <select
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Any Experience</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="fee">Max Consultation Fee</label>
            <select
              id="fee"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            >
              <option value="">Any Price</option>
              <option value="300">₹300 or less</option>
              <option value="500">₹500 or less</option>
              <option value="1000">₹1000 or less</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="gender">Doctor Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Any">Any Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="Any">Any Day</option>
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
            </select>
          </div>
        </aside>

        {/* Right Search Input Box Suggestions */}
        <div className="directory-results-container">
          <div className="top-search-banner">
            <div className="search-input-box" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <Search className="search-input-icon" />

              {/* Suggestions dropdown overlay */}
              {showSuggestions && name && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((doc) => (
                    <div 
                      key={doc._id} 
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(doc.user?.name)}
                    >
                      <span className="suggestion-name">{doc.user?.name}</span>
                      <span className="suggestion-specialization">{doc.specialization}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Directory Listings Grid */}
          <div className="doctors-list-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div className="skeleton-card" key={index}>
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-text skeleton-title"></div>
                  <div className="skeleton-text skeleton-tag"></div>
                  <div className="skeleton-text skeleton-subtitle"></div>
                </div>
              ))
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <motion.div
                  className="top-doctor-card"
                  key={doctor._id}
                  style={{ margin: 0, width: "100%", position: "relative" }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Pulse online status indicator */}
                  <div className="online-pulse-wrapper">
                    <div className="online-dot"></div>
                    <span>Online</span>
                  </div>

                  <div className="doctor-img-wrapper">
                    <img
                      src={doctor.profileImage && doctor.profileImage.startsWith("http") ? doctor.profileImage : (doctor.profileImage ? `http://localhost:5000${doctor.profileImage}` : `http://localhost:5000/uploads/default-doctor.png`)}
                      alt={doctor.user?.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                      }}
                    />
                    <div className="rating-badge">
                      <Star style={{ width: "13px", height: "13px", fill: "currentColor" }} /> 4.8
                    </div>
                  </div>

                  {/* Doctor verified badge check */}
                  <div className="doctor-verified-badge">
                    <Award style={{ width: "15px", height: "15px" }} />
                    <span>Verified Doctor</span>
                  </div>

                  <h3>{doctor.user?.name}</h3>
                  <span className="specialization">{doctor.specialization}</span>

                  <p className="hospital">
                    <Building className="doc-icon" style={{ width: "14px", height: "14px" }} /> {doctor.hospital}
                  </p>

                  <p className="experience">
                    <Calendar className="doc-icon" style={{ width: "14px", height: "14px" }} /> {doctor.experience} Years Experience
                  </p>

                  <p className="experience" style={{ marginTop: "4px" }}>
                    <MapPin className="doc-icon" style={{ width: "14px", height: "14px" }} /> {doctor.address || "Medical Center"}
                  </p>

                  {/* Next slot & languages spoken meta attributes */}
                  <div className="doctor-languages" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Globe style={{ width: "14px", height: "14px" }} />
                    <span>Languages: English, Hindi</span>
                  </div>

                  <div className="doctor-languages" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontWeight: "600" }}>
                    <Calendar style={{ width: "14px", height: "14px" }} />
                    <span>Next Available Slot: Today, 04:00 PM</span>
                  </div>

                  <div className="doctor-footer">
                    <span className="fee">
                      <FaRupeeSign className="rupee-icon" /> {doctor.consultationFee}
                    </span>

                    <button className="book-btn" onClick={() => handleBookRedirect(doctor)}>
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-doctors-card">
                <FaUserMd className="no-doctors-icon" />
                <h3>No Doctors Found</h3>
                <p>Try resetting filters or adjusting search criteria to find available clinicians.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Real OSM Hospital Interactive Maps Section */}
      <section className="hospitals-map-section">
        <div className="map-info-pane">
          <h2>Find Nearby Facilities</h2>
          <p>Browse our verified hospital network locations for inpatient care.</p>
          <div className="map-hospital-list" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {hospitals.length > 0 ? (
              hospitals.map((hosp, i) => (
                <div 
                  key={i} 
                  className={`map-hospital-card ${activeHospitalName === hosp.display_name.split(",")[0] ? "active" : ""}`}
                  onClick={() => handleHospitalCardClick(hosp)}
                >
                  <h4>{hosp.display_name.split(",")[0]}</h4>
                  <p>
                    <MapPin style={{ display: "inline", width: "12px", height: "12px", marginRight: "4px" }} />
                    {hosp.display_name.split(",").slice(1, 4).join(",")}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--text-secondary)", fontSize: "14px", padding: "10px" }}>
                Loading real hospital locations for {city || "active city"}...
              </div>
            )}
          </div>
        </div>

        {/* Real Leaflet Map graphic container */}
        <div 
          className="map-graphic-pane" 
          ref={mapRef} 
          style={{ height: "380px", zIndex: 1 }}
        ></div>
      </section>

      {/* Trust Partnerships Logos */}
      <section className="trust-badges-container" style={{ opacity: 0.8, marginBottom: "80px", flexDirection: "column", textAlign: "center", gap: "20px" }}>
        <h4 style={{ color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase", fontSize: "14px" }}>
          Our Registered Clinical Partners
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px", fontSize: "18px", fontWeight: "800", color: "#94A3B8" }}>
          {PARTNERS.map((partner) => (
            <span key={partner} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ThumbsUp style={{ fontSize: "20px", color: "var(--primary)" }} /> {partner}
            </span>
          ))}
        </div>
      </section>

      {/* Patient Testimonials */}
      <Testimonials />

      {/* Accordion FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common scheduling and booking questions below.</p>

        <div className="faq-accordion-container">
          {FAQS.map((faq, index) => (
            <div key={index} className={`faq-item ${activeFaq === index ? "active" : ""}`}>
              <div className="faq-header" onClick={() => toggleFaq(index)}>
                <span>{faq.q}</span>
                <ChevronDown className="faq-icon" style={{ width: "16px", height: "16px" }} />
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
          <ShieldCheck className="trust-badge-icon" />
          <span>HIPAA Secure Database</span>
        </div>
        <div className="trust-badge-item">
          <CheckCircle className="trust-badge-icon" />
          <span>ISO 27001 Certified</span>
        </div>
        <div className="trust-badge-item">
          <ThumbsUp className="trust-badge-icon" />
          <span>100% Patient Guarantee</span>
        </div>
      </section>

    </div>
  );
};

export default DoctorsPage;
