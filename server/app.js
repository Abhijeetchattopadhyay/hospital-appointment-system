import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  res.send("Hospital Appointment API is running");
});

export default app;