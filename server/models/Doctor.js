import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    profileImage: {
      type: String,
      default: ""
    },

    specialization: {
      type: String,
      required: true
    },

    qualification: {
      type: String,
      required: true
    },

    experience: {
      type: Number,
      required: true
    },

    consultationFee: {
      type: Number,
      required: true
    },

    hospital: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    availableDays: [
      {
        type: String
      }
    ],

    availableTime: {
      start: String,
      end: String
    },

    about: {
      type: String
    },

    isApproved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);