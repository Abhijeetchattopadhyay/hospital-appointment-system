import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  payAppointment,
  getAllAppointments,
  adminDeleteAppointment
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

// Patient pays for appointment
router.put(
  "/:id/pay",
  protect,
  authorizeRoles("patient"),
  payAppointment
);

// Admin routes for appointments
router.get(
  "/all",
  protect,
  authorizeRoles("admin"),
  getAllAppointments
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  adminDeleteAppointment
);

export default router;