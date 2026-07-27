import api from "./api";

// Book a new appointment
export const bookAppointment = async (appointmentData) => {
  const response = await api.post("/appointments/book", appointmentData);
  return response.data;
};

// Get patient's own appointments
export const getPatientAppointments = async () => {
  const response = await api.get("/appointments/my-appointments");
  return response.data;
};

// Get doctor's scheduled appointments
export const getDoctorAppointments = async () => {
  const response = await api.get("/appointments/doctor");
  return response.data;
};

// Update status of appointment (approve/cancel/complete)
export const updateAppointmentStatus = async (id, status, prescription) => {
  const response = await api.put(`/appointments/${id}/status`, { status, prescription });
  return response.data;
};

// Pay for an appointment
export const payAppointment = async (id) => {
  const response = await api.put(`/appointments/${id}/pay`);
  return response.data;
};

// Get all appointments (Admin only)
export const getAllAppointments = async () => {
  const response = await api.get("/appointments/all");
  return response.data;
};

// Delete an appointment (Admin only)
export const deleteAppointment = async (id) => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};


