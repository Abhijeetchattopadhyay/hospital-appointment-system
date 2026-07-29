import { useEffect, useState } from "react";
import { FaHospital, FaRegClock, FaRupeeSign, FaStar } from "react-icons/fa";
import { getAllDoctors } from "../../services/doctorService";
import { getImageUrl } from "../../utils/imageUrl";
import "./TopDoctors.css";

const TopDoctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    getAllDoctors()
      .then((data) => setDoctors(data.slice(0, 3)))
      .catch((error) => console.log("Failed to fetch top doctors:", error));
  }, []);

  return (
    <section className="top-doctors">
      <h2>Top Doctors</h2>

      <p className="section-subtitle">
        Meet our trusted doctors available for appointments.
      </p>

      <div className="top-doctors-grid">
        {doctors.map((doctor) => (
          <div className="top-doctor-card" key={doctor._id}>
            <div className="doctor-img-wrapper">
              <img
                src={getImageUrl(doctor.profileImage)}
                alt={doctor.user?.name || "Doctor"}
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

              <button className="book-btn">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopDoctors;
