import { FaHeartbeat, FaChild, FaBone, FaBrain, FaFemale, FaMicroscope } from "react-icons/fa";
import "./Services.css";

const Services = () => {
  const specialties = [
    {
      id: "cardiology",
      name: "Cardiology",
      desc: "Heart health excellence with advanced diagnostic imaging.",
      icon: <FaHeartbeat />,
      colorClass: "pink-theme",
    },
    {
      id: "pediatrics",
      name: "Pediatrics",
      desc: "Comprehensive care for infants, children, and adolescents.",
      icon: <FaChild />,
      colorClass: "mint-theme",
    },
    {
      id: "orthopedics",
      name: "Orthopedics",
      desc: "Joint replacement, sports medicine, and spinal treatments.",
      icon: <FaBone />,
      colorClass: "blue-theme",
    },
    {
      id: "neurology",
      name: "Neurology",
      desc: "Specialized care for neurological disorders and brain health.",
      icon: <FaBrain />,
      colorClass: "purple-theme",
    },
    {
      id: "maternity",
      name: "Maternity",
      desc: "Complete prenatal and postnatal support for mothers.",
      icon: <FaFemale />,
      colorClass: "teal-theme",
    },
    {
      id: "diagnostics",
      name: "Diagnostics",
      desc: "State-of-the-art laboratory testing and radiology services.",
      icon: <FaMicroscope />,
      colorClass: "gray-theme",
    },
  ];

  return (
    <section className="services" id="services">
      <h2>Specialty Services</h2>
      <p className="section-subtitle">
        Leading medical expertise across all health domains.
      </p>

      <div className="services-grid">
        {specialties.map((spec) => (
          <div className="service-card" key={spec.id}>
            <div className={`service-icon-wrapper ${spec.colorClass}`}>
              {spec.icon}
            </div>
            <h3>{spec.name}</h3>
            <p>{spec.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
