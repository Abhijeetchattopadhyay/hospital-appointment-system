import React from "react";
import Card from "../components/UI/Card";
import { FaStethoscope, FaFlask, FaCalendarAlt, FaPhoneAlt } from "react-icons/fa";

const ServicesPage = () => {
  const services = [
    { name: "General Consultation", desc: "Routine health screening, primary checkups, and diagnostic advice.", icon: <FaStethoscope /> },
    { name: "Laboratory & Diagnostics", desc: "Fast and certified blood tests, MRI scans, X-rays, and pathology reporting.", icon: <FaFlask /> },
    { name: "Online Appointments", desc: "Easy, secure 24/7 web booking engine to schedule appointments.", icon: <FaCalendarAlt /> },
    { name: "Emergency Dispatch", desc: "Instant responsive trauma treatment and ambulance support coordination.", icon: <FaPhoneAlt /> },
  ];

  return (
    <div style={{ padding: "60px 8%", background: "#f8fbfa", minHeight: "80vh" }}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontSize: "36px", color: "#0f2942", fontWeight: 700 }}>Our Healthcare Services</h1>
        <p style={{ color: "#64748b", fontSize: "16px", marginTop: "10px" }}>
          Premium patient-centric solutions covering all medical situations.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "30px"
      }}>
        {services.map((s, index) => (
          <Card
            key={index}
            hoverable
            title={s.name}
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
                {s.icon}
              </div>
            }
          >
            <p style={{ color: "#64748b", fontSize: "14.5px", lineHeight: 1.5 }}>
              {s.desc} HealthTrust combines skilled medical staff with compassionate operational care to deliver seamless clinical visits.
            </p>
            <div style={{ marginTop: "20px", fontSize: "13.5px", fontWeight: 600, color: "var(--primary)" }}>
              Access Service &rarr;
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;