import api from "./api";

// Login User
export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

// Register User
export const registerUser = async (userData) => {
  const isFormData = userData instanceof FormData;
  const response = await api.post("/auth/register", userData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {}
  });
  return response.data;
};

// Get all patients (Admin only)
export const getAllPatients = async () => {
  const response = await api.get("/auth/patients");
  return response.data;
};

// Delete patient profile (Admin only)
export const deletePatient = async (id) => {
  const response = await api.delete(`/auth/patients/${id}`);
  return response.data;
};

// Request password reset email link
export const forgotPassword = async (emailData) => {
  const response = await api.post("/auth/forgot-password", emailData);
  return response.data;
};

// Update password with reset token
export const resetPassword = async (token, passwordData) => {
  const response = await api.put(`/auth/reset-password/${token}`, passwordData);
  return response.data;
};

// Update user profile details
export const updateProfile = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};