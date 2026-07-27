import { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="contact-page">

      <section className="contact-hero">
        <h1>Contact MediCare+</h1>
        <p>
          Have questions or need assistance? Reach out to our customer support or emergency 
          lines. We are here to help you 24/7.
        </p>
      </section>

      <section className="contact-content-section">
        {/* Info Card */}
        <div className="contact-info-card">
          <div>
            <h2>Get in Touch</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: "10px 0 0" }}>
              Our admin team will get back to you within 24 hours.
            </p>
          </div>

          <div className="contact-detail-item">
            <div className="contact-detail-icon">
              <FaPhoneAlt />
            </div>
            <div className="contact-detail-info">
              <h4>Phone Support</h4>
              <p>+1 (555) 234-5678</p>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>Emergency: +1 (555) 911-0000</p>
            </div>
          </div>

          <div className="contact-detail-item">
            <div className="contact-detail-icon">
              <FaEnvelope />
            </div>
            <div className="contact-detail-info">
              <h4>Email Support</h4>
              <p>support@medicareplus.com</p>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>appointments@medicareplus.com</p>
            </div>
          </div>

          <div className="contact-detail-item">
            <div className="contact-detail-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="contact-detail-info">
              <h4>Main Hospital Location</h4>
              <p>123 Medical Center Parkway</p>
              <p>Suite 400, Healthcare City, HC 94016</p>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="contact-form-card">
          <h2>Send Us a Message</h2>

          {submitted && (
            <div className="success-message" style={{ marginBottom: "24px" }}>
              <FaCheckCircle style={{ flexShrink: 0 }} />
              <span>Thank you! Your message has been submitted successfully.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <div className="contact-input-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="contact-input-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="How can we help you?"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-input-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="contact-submit-btn">
              Send Message <FaPaperPlane style={{ marginLeft: "8px" }} />
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Contact;
