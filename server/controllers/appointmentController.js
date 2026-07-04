import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const alreadyBooked = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      status: { $ne: "cancelled" }
    });

    if (alreadyBooked) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      amount: doctor.consultationFee
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id
    })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id
    })
      .populate("patient", "name email")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["approved", "rejected", "completed"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Use approved, rejected, or completed"
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to update this appointment"
      });
    }

    appointment.status = status;

    const updatedAppointment = await appointment.save();

    res.status(200).json({
      message: `Appointment ${status} successfully`,
      appointment: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};