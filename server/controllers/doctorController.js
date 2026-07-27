import mongoose from "mongoose";
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
    const { city, hospital, specialization, name, experience, fee, adminMode } = req.query;
    
    let query = {};
    
    if (adminMode !== "true") {
      query.isApproved = true;
    }
    
    if (city) {
      query.address = { $regex: city, $options: "i" };
    }
    
    if (hospital) {
      query.hospital = { $regex: hospital, $options: "i" };
    }
    
    if (specialization && specialization !== "All") {
      query.specialization = { $regex: specialization, $options: "i" };
    }

    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    if (fee) {
      query.consultationFee = { $lte: Number(fee) };
    }
    
    if (name) {
      const User = mongoose.model("User");
      const matchingUsers = await User.find({
        name: { $regex: name, $options: "i" },
        role: "doctor"
      }).select("_id");
      
      const userIds = matchingUsers.map(u => u._id);
      query.user = { $in: userIds };
    }
    
    const doctors = await Doctor.find(query)
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

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    doctor.specialization = req.body.specialization || doctor.specialization;
    doctor.qualification = req.body.qualification || doctor.qualification;
    doctor.experience = req.body.experience || doctor.experience;
    doctor.consultationFee = req.body.consultationFee || doctor.consultationFee;
    doctor.hospital = req.body.hospital || doctor.hospital;
    doctor.address = req.body.address || doctor.address;
    doctor.availableDays = req.body.availableDays || doctor.availableDays;
    doctor.availableTime = req.body.availableTime || doctor.availableTime;
    doctor.about = req.body.about || doctor.about;

    const updatedDoctor = await doctor.save();

    res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadDoctorPhoto = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    doctor.profileImage = `/uploads/${req.file.filename}`;

    const updatedDoctor = await doctor.save();

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      profileImage: updatedDoctor.profileImage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin approves/declines doctor verification status
export const approveDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    
    doctor.isApproved = req.body.isApproved;
    const updatedDoctor = await doctor.save();
    
    res.status(200).json({
      message: `Doctor profile ${doctor.isApproved ? "approved" : "declined"} successfully`,
      doctor: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin deletes doctor profile
export const deleteDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // Delete the associated user account
    const User = mongoose.model("User");
    await User.findByIdAndDelete(doctor.user);

    // Delete the doctor profile itself
    await Doctor.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Doctor profile and associated user account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};