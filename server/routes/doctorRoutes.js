import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  createDoctorProfile,
  getAllDoctors,
  getDoctorProfile,
  updateDoctorProfile,
  uploadDoctorPhoto
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
router.put(
  "/profile",
  protect,
  authorizeRoles("doctor"),
  updateDoctorProfile
);
router.post(
  "/upload-photo",
  protect,
  authorizeRoles("doctor"),
  upload.single("profileImage"),
  uploadDoctorPhoto
);

export default router;

