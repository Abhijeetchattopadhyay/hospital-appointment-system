import { useEffect, useState } from "react";
import { FaHospital, FaRegClock, FaRupeeSign, FaStar } from "react-icons/fa";
import "./TopDoctors.css";

const TopDoctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data.slice(0, 3)))
      .catch((error) => console.log(error));
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
                src={`http://localhost:5000${doctor.profileImage}`}
                alt={doctor.user?.name}
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
