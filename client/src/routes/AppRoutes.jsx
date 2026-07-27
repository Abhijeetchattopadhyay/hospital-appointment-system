import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import PatientLayout from "../layouts/PatientLayout";

// Components
import ProtectedRoute from "../components/common/ProtectedRoute";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DoctorsPage from "../pages/DoctorsPage";
import Departments from "../pages/Departments";
import ServicesPage from "../pages/ServicesPage";
import About from "../pages/About";
import Contact from "../pages/Contact";
import BookAppointment from "../pages/BookAppointment";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Dashboards
import PatientDashboard from "../pages/patient/Dashboard";
import PatientBookAppointment from "../pages/patient/PatientBookAppointment";
import DoctorDashboard from "../pages/doctor/Dashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Routes wrapped in MainLayout (Navbar + Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* 2. Protected Patient Routes (uses custom PatientLayout sidebar) */}
      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path="/patient" element={<PatientLayout />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="book-appointment" element={<PatientBookAppointment />} />
        </Route>
      </Route>

      {/* 3. Protected Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      </Route>

      {/* 4. Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;