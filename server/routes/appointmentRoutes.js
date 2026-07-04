import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
} from "../controllers/appointmentController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Patient books an appointment
router.post(
  "/book",
  protect,
  authorizeRoles("patient"),
  bookAppointment
);

// Patient views own appointments
router.get(
  "/my-appointments",
  protect,
  authorizeRoles("patient"),
  getMyAppointments
);

// Doctor views appointments
router.get(
  "/doctor",
  protect,
  authorizeRoles("doctor"),
  getDoctorAppointments
);

// Doctor updates appointment status
router.put(
  "/:id/status",
  protect,
  authorizeRoles("doctor"),
  updateAppointmentStatus
);

export default router;