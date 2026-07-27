import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import validateEmail from "../utils/validateEmail.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: validateEmail,
        message: "Please enter a valid email address without typos."
      }
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient"
    },
    dob: {
      type: String,
      default: ""
    },
    gender: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    bloodGroup: {
      type: String,
      default: ""
    },
    height: {
      type: Number,
      default: 0
    },
    weight: {
      type: Number,
      default: 0
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 mins)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;