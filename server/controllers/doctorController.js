import Doctor from "../models/Doctor.js";

export const createDoctorProfile = async (req, res) => {
  try {
    const existingProfile = await Doctor.findOne({ user: req.user._id });

    if (existingProfile) {
      return res.status(400).json({ message: "Doctor profile already exists" });
    }

    const doctor = await Doctor.create({
      user: req.user._id,
      specialization: req.body.specialization,
      qualification: req.body.qualification,
      experience: req.body.experience,
      consultationFee: req.body.consultationFee,
      hospital: req.body.hospital,
      address: req.body.address,
      availableDays: req.body.availableDays,
      availableTime: req.body.availableTime,
      about: req.body.about
    });

    res.status(201).json({
      message: "Doctor profile created successfully",
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate(
      "user",
      "name email role"
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};