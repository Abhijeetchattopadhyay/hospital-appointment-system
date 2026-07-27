import api from "./api";

// Get all doctors with optional filters
export const getAllDoctors = async (params = {}) => {
  const response = await api.get("/doctors", { params });
  return response.data;
};

// Get doctor profile (own)
export const getDoctorProfile = async () => {
  const response = await api.get("/doctors/my-profile");
  return response.data;
};

// Create doctor profile
export const createDoctorProfile = async (profileData) => {
  const response = await api.post("/doctors/profile", profileData);
  return response.data;
};

// Update doctor profile
export const updateDoctorProfile = async (profileData) => {
  const response = await api.put("/doctors/profile", profileData);
  return response.data;
};

// Upload doctor profile photo
export const uploadDoctorPhoto = async (formData) => {
  const response = await api.post("/doctors/upload-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Admin approves/declines doctor verification status
export const approveDoctor = async (id, isApproved) => {
  const response = await api.put(`/doctors/${id}/approve`, { isApproved });
  return response.data;
};

// Admin deletes doctor profile
export const deleteDoctor = async (id) => {
  const response = await api.delete(`/doctors/${id}`);
  return response.data;
};
