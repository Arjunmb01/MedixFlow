import axiosInstance from "@/core/api/axios";

export const joinVideoWaitingRoom = async (appointmentId: string) => {
  const res = await axiosInstance.post(
    `/patient/video/appointments/${appointmentId}/join-waiting-room`
  );
  return res.data;
};

export const startVideoConsultation = async (
  appointmentId: string,
  admitPatient = true
) => {
  const res = await axiosInstance.post(
    `/doctor/video/appointments/${appointmentId}/start`,
    { admitPatient }
  );
  return res.data;
};

export const admitPatient = async (sessionId: string) => {
  const res = await axiosInstance.post(`/doctor/video/sessions/${sessionId}/admit`);
  return res.data;
};

export const endVideoConsultation = async (sessionId: string, summary?: string) => {
  const res = await axiosInstance.post(`/doctor/video/sessions/${sessionId}/end`, {
    summary,
  });
  return res.data;
};

export const getVideoSessionState = async (params: {
  appointmentId?: string;
  sessionId?: string;
}) => {
  const res = await axiosInstance.get("/doctor/video/session-state", { params });
  return res.data;
};

export const getPatientVideoSessionState = async (params: {
  appointmentId?: string;
  sessionId?: string;
}) => {
  const res = await axiosInstance.get("/patient/video/session-state", { params });
  return res.data;
};

export const sendConsultationChat = async (
  sessionId: string,
  message: string,
  role: "doctor" | "patient"
) => {
  const res = await axiosInstance.post(`/${role}/video/sessions/${sessionId}/chat`, {
    message,
  });
  return res.data;
};
