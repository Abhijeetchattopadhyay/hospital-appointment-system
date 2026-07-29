/**
 * Seed Script — Hospital Management System
 * Run with: node seed.js
 * Seeds: 1 admin, 4 patients, 8 doctors, 6 appointments
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// ─── Inline minimal models (avoid circular import issues) ────────────────────

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    city: { type: String, default: "" },
    phone: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    height: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    profileImage: { type: String, default: "" },
    specialization: String,
    qualification: String,
    experience: Number,
    consultationFee: Number,
    hospital: String,
    address: String,
    availableDays: [String],
    availableTime: { start: String, end: String },
    about: String,
    degree: { type: String, default: "" },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: String,
    appointmentTime: String,
    reason: String,
    status: { type: String, enum: ["pending", "approved", "rejected", "completed", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    amount: Number,
    prescription: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Doctor = mongoose.model("Doctor", doctorSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);

// ─── Helper ──────────────────────────────────────────────────────────────────

const hashPassword = async (plain) => bcrypt.hash(plain, 10);

// ─── Seed Data ───────────────────────────────────────────────────────────────

const usersData = [
  // Admin
  {
    name: "Admin Superuser",
    email: "admin@medicare.com",
    password: "admin@123",
    role: "admin",
    gender: "Male",
    city: "Mumbai",
    phone: "9000000001",
  },
  // Patients
  {
    name: "Riya Sharma",
    email: "riya.sharma@gmail.com",
    password: "patient@123",
    role: "patient",
    dob: "1995-04-12",
    gender: "Female",
    city: "Delhi",
    phone: "9123456780",
    bloodGroup: "B+",
    height: 162,
    weight: 54,
  },
  {
    name: "Arjun Mehta",
    email: "arjun.mehta@gmail.com",
    password: "patient@123",
    role: "patient",
    dob: "1988-09-23",
    gender: "Male",
    city: "Bangalore",
    phone: "9234567891",
    bloodGroup: "O+",
    height: 175,
    weight: 72,
  },
  {
    name: "Priya Nair",
    email: "priya.nair@gmail.com",
    password: "patient@123",
    role: "patient",
    dob: "2000-01-05",
    gender: "Female",
    city: "Chennai",
    phone: "9345678902",
    bloodGroup: "A-",
    height: 158,
    weight: 50,
  },
  {
    name: "Karan Singh",
    email: "karan.singh@gmail.com",
    password: "patient@123",
    role: "patient",
    dob: "1992-07-17",
    gender: "Male",
    city: "Pune",
    phone: "9456789013",
    bloodGroup: "AB+",
    height: 180,
    weight: 80,
  },
  {
    name: "Akshat Gupta",
    email: "akshat.gupta@gmail.com",
    password: "patient@123",
    role: "patient",
    dob: "1997-11-15",
    gender: "Male",
    city: "Noida",
    phone: "9876543210",
    bloodGroup: "A+",
    height: 178,
    weight: 70,
  },
  // Doctors
  {
    name: "Dr. Anil Kapoor",
    email: "anil.kapoor@medicare.com",
    password: "doctor@123",
    role: "doctor",
    gender: "Male",
    city: "Mumbai",
    phone: "9567890124",
  },
  {
    name: "Dr. Sunita Rao",
    email: "sunita.rao@medicare.com",
    password: "doctor@123",
    role: "doctor",
    gender: "Female",
    city: "Delhi",
    phone: "9678901235",
  },
  {
    name: "Dr. Rajesh Patel",
    email: "rajesh.patel@medicare.com",
    password: "doctor@123",
    role: "doctor",
    gender: "Male",
    city: "Ahmedabad",
    phone: "9789012346",
  },
  {
    name: "Dr. Meera Iyer",
    email: "meera.iyer@medicare.com",
    password: "doctor@123",
    role: "doctor",
    gender: "Female",
    city: "Chennai",
    phone: "9890123457",
  },
  {
    name: "Dr. Vikram Bose",
    email: "vikram.bose@medicare.com",
    password: "doctor@123",
    role: "doctor",
    gender: "Male",
    city: "Kolkata",
    phone: "9901234568",
  },
  {
    name: "Dr. Pooja Desai",
    email: "pooja.desai@medicare.com",
    password: "doctor@123",
    role: "doctor",
    gender: "Female",
    city: "Surat",
    phone: "9012345679",
  },
  {
    name: "Dr. Sanjay Kumar",
    email: "sanjay.kumar@medicare.com",
    password: "doctor@123",
    role: "doctor",
    gender: "Male",
    city: "Hyderabad",
    phone: "9123456790",
  },
  {
    name: "Dr. Ananya Ghosh",
    email: "ananya.ghosh@medicare.com",
    password: "doctor@123",
    role: "doctor",
    gender: "Female",
    city: "Bangalore",
    phone: "9234567801",
  },
];

const doctorDetails = [
  {
    specialization: "General Physician",
    qualification: "MBBS, MD (General Medicine)",
    experience: 12,
    consultationFee: 500,
    hospital: "Apollo Hospital Mumbai",
    address: "Apollo Towers, Andheri East, Mumbai - 400069",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: { start: "09:00", end: "17:00" },
    about: "Dr. Anil Kapoor is a senior general physician with over 12 years of experience. He specializes in preventive care, chronic disease management, and primary health consultations.",
  },
  {
    specialization: "Cardiology",
    qualification: "MBBS, MD, DM (Cardiology)",
    experience: 18,
    consultationFee: 1200,
    hospital: "AIIMS Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: { start: "10:00", end: "16:00" },
    about: "Dr. Sunita Rao is a renowned cardiologist at AIIMS Delhi with 18 years of expertise in interventional cardiology, heart failure management, and cardiac imaging.",
  },
  {
    specialization: "Neurology",
    qualification: "MBBS, MD, DM (Neurology)",
    experience: 15,
    consultationFee: 1000,
    hospital: "Sterling Hospital Ahmedabad",
    address: "Near Gurukul, Off Drive-In Road, Ahmedabad - 380052",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTime: { start: "11:00", end: "18:00" },
    about: "Dr. Rajesh Patel is a leading neurologist with 15 years of experience in treating epilepsy, stroke, Parkinson's disease, and other complex neurological disorders.",
  },
  {
    specialization: "Dental Care",
    qualification: "BDS, MDS (Oral & Maxillofacial Surgery)",
    experience: 10,
    consultationFee: 400,
    hospital: "Apollo Dental Chennai",
    address: "No. 21, Cathedral Road, Gopalapuram, Chennai - 600086",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
    availableTime: { start: "09:00", end: "20:00" },
    about: "Dr. Meera Iyer is a skilled dental surgeon with 10 years of experience in cosmetic dentistry, implantology, orthodontics, and oral rehabilitation.",
  },
  {
    specialization: "Cardiology",
    qualification: "MBBS, MD (Medicine), DM (Cardiology)",
    experience: 20,
    consultationFee: 1500,
    hospital: "AMRI Hospital Kolkata",
    address: "P4 & 5, CIT Scheme, Dhakuria, Kolkata - 700031",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    availableTime: { start: "08:00", end: "14:00" },
    about: "Dr. Vikram Bose is a veteran cardiologist with 20 years of practice. He has performed over 5000 cardiac procedures and is a pioneer in minimally invasive heart surgeries.",
  },
  {
    specialization: "General Physician",
    qualification: "MBBS, MD (Internal Medicine)",
    experience: 8,
    consultationFee: 450,
    hospital: "New Civil Hospital Surat",
    address: "Station Road, Majura Gate, Surat - 395001",
    availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
    availableTime: { start: "10:00", end: "19:00" },
    about: "Dr. Pooja Desai is a compassionate physician specializing in internal medicine, diabetes management, and women's health. She is known for her patient-centered approach.",
  },
  {
    specialization: "Neurology",
    qualification: "MBBS, MD (Neurology), MRCP (UK)",
    experience: 14,
    consultationFee: 900,
    hospital: "Yashoda Hospital Hyderabad",
    address: "Raj Bhavan Road, Somajiguda, Hyderabad - 500082",
    availableDays: ["Tuesday", "Wednesday", "Thursday", "Saturday"],
    availableTime: { start: "09:00", end: "16:00" },
    about: "Dr. Sanjay Kumar is a distinguished neurologist with international training. He specializes in headache disorders, multiple sclerosis, and neuromuscular diseases.",
  },
  {
    specialization: "Dental Care",
    qualification: "BDS, MDS (Orthodontics & Dentofacial Orthopaedics)",
    experience: 7,
    consultationFee: 350,
    hospital: "Manipal Hospital Bangalore",
    address: "98, HAL Airport Road, Kodihalli, Bangalore - 560017",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    availableTime: { start: "10:00", end: "18:00" },
    about: "Dr. Ananya Ghosh is a specialist orthodontist with 7 years of expertise in braces, Invisalign, and corrective jaw surgeries. She is passionate about creating beautiful smiles.",
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────

const seed = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB:", process.env.MONGO_URI.split("@")[1]);

    // Clear existing data
    console.log("\n🗑️  Clearing existing data...");
    await Appointment.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});
    console.log("   Cleared Users, Doctors, Appointments");

    // Create users with hashed passwords
    console.log("\n👥 Creating users...");
    const createdUsers = [];
    for (const userData of usersData) {
      const hashed = await hashPassword(userData.password);
      const user = await User.create({ ...userData, password: hashed });
      createdUsers.push(user);
      console.log(`   ✅ ${user.role.padEnd(8)} → ${user.name} (${user.email})`);
    }

    // Separate by role
    const adminUsers  = createdUsers.filter(u => u.role === "admin");
    const patientUsers = createdUsers.filter(u => u.role === "patient");
    const doctorUsers  = createdUsers.filter(u => u.role === "doctor");

    // Create doctor profiles
    console.log("\n🩺 Creating doctor profiles...");
    const createdDoctors = [];
    for (let i = 0; i < doctorUsers.length; i++) {
      const doctor = await Doctor.create({
        user: doctorUsers[i]._id,
        isApproved: true,
        ...doctorDetails[i],
      });
      createdDoctors.push(doctor);
      console.log(`   ✅ ${doctorUsers[i].name} → ${doctorDetails[i].specialization}`);
    }

    // Create appointments
    console.log("\n📅 Creating appointments...");
    const appointmentData = [
      {
        patient: patientUsers[0]._id,
        doctor: createdDoctors[0]._id,
        appointmentDate: "2026-08-05",
        appointmentTime: "10:00",
        reason: "Routine check-up and blood pressure monitoring",
        status: "approved",
        paymentStatus: "paid",
        amount: createdDoctors[0].consultationFee,
        prescription: "Take Amlodipine 5mg daily. Reduce salt intake. Follow up in 1 month.",
      },
      {
        patient: patientUsers[1]._id,
        doctor: createdDoctors[1]._id,
        appointmentDate: "2026-08-06",
        appointmentTime: "11:00",
        reason: "Chest pain and shortness of breath during exercise",
        status: "approved",
        paymentStatus: "paid",
        amount: createdDoctors[1].consultationFee,
      },
      {
        patient: patientUsers[2]._id,
        doctor: createdDoctors[3]._id,
        appointmentDate: "2026-08-07",
        appointmentTime: "14:00",
        reason: "Tooth sensitivity and cavity treatment",
        status: "pending",
        paymentStatus: "pending",
        amount: createdDoctors[3].consultationFee,
      },
      {
        patient: patientUsers[3]._id,
        doctor: createdDoctors[2]._id,
        appointmentDate: "2026-08-08",
        appointmentTime: "11:30",
        reason: "Recurring migraines and severe headaches",
        status: "approved",
        paymentStatus: "paid",
        amount: createdDoctors[2].consultationFee,
      },
      {
        patient: patientUsers[0]._id,
        doctor: createdDoctors[4]._id,
        appointmentDate: "2026-08-10",
        appointmentTime: "09:00",
        reason: "ECG and cardiac stress test evaluation",
        status: "pending",
        paymentStatus: "pending",
        amount: createdDoctors[4].consultationFee,
      },
      {
        patient: patientUsers[1]._id,
        doctor: createdDoctors[5]._id,
        appointmentDate: "2026-07-25",
        appointmentTime: "16:00",
        reason: "Diabetes management and HbA1c review",
        status: "completed",
        paymentStatus: "paid",
        amount: createdDoctors[5].consultationFee,
        prescription: "Continue Metformin 500mg twice daily. Maintain a low-carb diet. Check blood sugar daily.",
      },
    ];

    for (const appt of appointmentData) {
      await Appointment.create(appt);
    }
    console.log(`   ✅ Created ${appointmentData.length} appointments`);

    // Summary
    console.log("\n" + "═".repeat(60));
    console.log("🎉 SEED COMPLETE!");
    console.log("═".repeat(60));
    console.log("\n📋 LOGIN CREDENTIALS:");
    console.log("   Admin   → admin@medicare.com         / admin@123");
    console.log("   Patient → riya.sharma@gmail.com      / patient@123");
    console.log("   Patient → arjun.mehta@gmail.com      / patient@123");
    console.log("   Patient → priya.nair@gmail.com       / patient@123");
    console.log("   Patient → karan.singh@gmail.com      / patient@123");
    console.log("   Doctor  → anil.kapoor@medicare.com   / doctor@123");
    console.log("   Doctor  → sunita.rao@medicare.com    / doctor@123");
    console.log("   Doctor  → rajesh.patel@medicare.com  / doctor@123");
    console.log("   Doctor  → meera.iyer@medicare.com    / doctor@123");
    console.log("   Doctor  → vikram.bose@medicare.com   / doctor@123");
    console.log("   Doctor  → pooja.desai@medicare.com   / doctor@123");
    console.log("   Doctor  → sanjay.kumar@medicare.com  / doctor@123");
    console.log("   Doctor  → ananya.ghosh@medicare.com  / doctor@123");
    console.log("\n📊 SUMMARY:");
    console.log(`   👤 ${adminUsers.length} Admin | 🧑 ${patientUsers.length} Patients | 🩺 ${createdDoctors.length} Doctors | 📅 ${appointmentData.length} Appointments`);
    console.log("═".repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
