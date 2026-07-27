import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllPatients,
  deletePatient,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("degree"), registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Admin-specific patient endpoints
router.get("/patients", protect, authorizeRoles("admin"), getAllPatients);
router.delete("/patients/:id", protect, authorizeRoles("admin"), deletePatient);

export default router;