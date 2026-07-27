import { FaUserMd, FaHospital, FaUserInjured, FaHeadset } from "react-icons/fa";
import "./Stats.css";

const Stats = () => {
  return (
    <section className="stats">
      <div className="stat-box">
        <div className="stat-icon-wrapper doctors">
          <FaUserMd />
        </div>
        <div className="stat-content">
          <h2>250+</h2>
          <p>Doctors</p>
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-icon-wrapper hospitals">
          <FaHospital />
        </div>
        <div className="stat-content">
          <h2>50+</h2>
          <p>Hospitals</p>
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-icon-wrapper patients">
          <FaUserInjured />
        </div>
        <div className="stat-content">
          <h2>10k+</h2>
          <p>Patients</p>
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-icon-wrapper support">
          <FaHeadset />
        </div>
        <div className="stat-content">
          <h2>24×7</h2>
          <p>Support</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;
