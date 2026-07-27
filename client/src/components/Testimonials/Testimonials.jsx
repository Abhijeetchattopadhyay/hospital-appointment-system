import { FaStar } from "react-icons/fa";
import "./Testimonials.css";

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2>What Our Patients Say</h2>

      <p className="section-subtitle">
        Trusted by thousands of happy patients.
      </p>

      <div className="testimonials-grid">
        <div className="testimonial-card">
          <p>
            "The booking process was smooth and the doctor was very
            professional. Highly recommended!"
          </p>

          <div className="stars-wrapper">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
          </div>

          <strong>Rahul Sharma</strong>
        </div>

        <div className="testimonial-card">
          <p>
            "Excellent healthcare service with experienced doctors and
            instant appointment confirmation."
          </p>

          <div className="stars-wrapper">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
          </div>

          <strong>Priya Singh</strong>
        </div>

        <div className="testimonial-card">
          <p>
            "Very clean interface. Finding specialists and booking
            appointments has never been easier."
          </p>

          <div className="stars-wrapper">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
          </div>

          <strong>Aman Verma</strong>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
