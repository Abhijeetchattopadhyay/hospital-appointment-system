import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import fs from "fs";
import validateEmail from "../utils/validateEmail.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === "admin") {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error deleting file: ", err);
        }
      }
      return res.status(400).json({ message: "Registration as administrator is not permitted." });
    }

    if (!email || !validateEmail(email)) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error deleting file: ", err);
        }
      }
      return res.status(400).json({ message: "Please enter a valid email address without typos." });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error deleting file: ", err);
        }
      }
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "doctor") {
      const { specialization, qualification, experience, consultationFee, hospital, address } = req.body;
      if (!specialization || !qualification || !experience || !consultationFee || !hospital || !address) {
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (err) {
            console.error("Error deleting file: ", err);
          }
        }
        return res.status(400).json({ message: "All doctor professional details are required for registration." });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Degree document upload is required for doctor registration." });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (role === "doctor") {
      const { specialization, qualification, experience, consultationFee, hospital, address } = req.body;
      await Doctor.create({
        user: user._id,
        specialization,
        qualification,
        experience: Number(experience),
        consultationFee: Number(consultationFee),
        hospital,
        address,
        degree: `/uploads/${req.file.filename}`,
        isApproved: false
      });
    }

    res.status(201).json({
      message: role === "doctor"
        ? "Doctor profile submitted successfully! Awaiting administrator verification before login access is active."
        : "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: role === "doctor" ? null : generateToken(user._id, user.role)
    });
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Error deleting file: ", err);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address without typos." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: user._id });
      if (!doctor || !doctor.isApproved) {
        return res.status(403).json({
          message: "Your doctor account is pending administrator verification and approval. You cannot log in yet."
        });
      }
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dob: user.dob || "",
        gender: user.gender || "",
        city: user.city || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "",
        height: user.height || 0,
        weight: user.weight || 0
      },
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.status(200).json({
    message: "Profile fetched successfully",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      dob: req.user.dob || "",
      gender: req.user.gender || "",
      city: req.user.city || "",
      phone: req.user.phone || "",
      bloodGroup: req.user.bloodGroup || "",
      height: req.user.height || 0,
      weight: req.user.weight || 0
    }
  });
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
    user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
    user.city = req.body.city !== undefined ? req.body.city : user.city;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.bloodGroup = req.body.bloodGroup !== undefined ? req.body.bloodGroup : user.bloodGroup;
    user.height = req.body.height !== undefined ? Number(req.body.height) : user.height;
    user.weight = req.body.weight !== undefined ? Number(req.body.weight) : user.weight;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dob: user.dob || "",
        gender: user.gender || "",
        city: user.city || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "",
        height: user.height || 0,
        weight: user.weight || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Patient not found" });
    }
    if (user.role !== "patient") {
      return res.status(400).json({ message: "User is not a patient" });
    }
    await User.findByIdAndDelete(req.params.id);
    // Also delete their appointments to clean up
    await Appointment.deleteMany({ patient: req.params.id });
    res.status(200).json({ message: "Patient account and their appointments deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset link
    const frontendUrl = req.headers.origin || "http://localhost:5175";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 10 minutes.`;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f5f9; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">You are receiving this email because you (or someone else) has requested to reset the password for your Medicare+ account.</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Please click the button below to choose a new password. This link is valid for 10 minutes only.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Reset My Password</a>
        </div>
        <p style="color: #64748b; font-size: 13.5px; line-height: 1.6;">If you did not request a password reset, you can safely ignore this email; your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Medicare+ Health Management Systems, Inc.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Medicare+ Password Reset Request",
        message,
        html: htmlMessage,
      });

      res.status(200).json({ message: "Password reset link emailed successfully!" });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: "Password reset email could not be sent. Please try again later." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    // Hash token from request params
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "The reset link is invalid or has expired. Please request a new link." });
    }

    // Hash & update password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully! Redirecting to login..." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};