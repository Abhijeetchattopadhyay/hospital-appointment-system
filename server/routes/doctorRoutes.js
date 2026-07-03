import express from "express";
import {
  createDoctorProfile,
  getAllDoctors,
  getDoctorProfile
} from "../controllers/doctorController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/profile",
  protect,
  authorizeRoles("doctor"),
  createDoctorProfile
);

router.get("/", getAllDoctors);

router.get(
  "/my-profile",
  protect,
  authorizeRoles("doctor"),
  getDoctorProfile
);

export default router;