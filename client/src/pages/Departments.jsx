import React from "react";
import Card from "../components/UI/Card";
import { FaHeartbeat, FaChild, FaBone, FaBrain, FaFemale, FaEye } from "react-icons/fa";
import "./About.css"; // Reuse general page layout styles or keep clean styles

const Departments = () => {
  const depts = [
    { name: "Cardiology", desc: "Expert heart and vascular care.", icon: <FaHeartbeat /> },
    { name: "Pediatrics", desc: "Compassionate child healthcare.", icon: <FaChild /> },
    { name: "Orthopedics", desc: "Specialist bone and joint treatment.", icon: <FaBone /> },
    { name: "Neurology", desc: "Advanced nervous system treatment.", icon: <FaBrain /> },
    { name: "Maternity", desc: "Dedicated prenatal and postnatal care.", icon: <FaFemale /> },
    { name: "Ophthalmology", desc: "Comprehensive vision and eye surgery.", icon: <FaEye /> },
  ];

  return (
    <div style={{ padding: "60px 8%", background: "#f8fbfa", minHeight: "80vh" }}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontSize: "36px", color: "#0f2942", fontWeight: 700 }}>Medical Departments</h1>
        <p style={{ color: "#64748b", fontSize: "16px", marginTop: "10px" }}>
          Explore our wide range of specialized fields committed to your health.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "30px"
      }}>
        {depts.map((d, index) => (
          <Card
            key={index}
            hoverable
            title={d.name}
            headerActions={
              <div style={{
                color: "var(--primary)",
                fontSize: "20px",
                background: "#EBF5F3",
                padding: "10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center"
              }}>
                {d.icon}
              </div>
            }
          >
            <p style={{ color: "#64748b", fontSize: "14.5px", lineHeight: 1.5 }}>
              {d.desc} Our certified practitioners use state-of-the-art procedures and equipment to provide standard-setting therapy.
            </p>
            <div style={{ marginTop: "20px", fontSize: "13.5px", fontWeight: 600, color: "var(--primary)" }}>
              Learn More &rarr;
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Departments;