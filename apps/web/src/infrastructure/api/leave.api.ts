import api from "@/core/api/axios";

export const LEAVE_TYPES = [
  { value: "VACATION", label: "Vacation", },
  { value: "SICK", label: "Sick Leave", },
  { value: "MATERNITY", label: "Maternity / Paternity",  },
  { value: "EMERGENCY", label: "Emergency",  },
  { value: "CONFERENCE", label: "Conference / Training", },
  { value: "PERSONAL", label: "Personal",  },
  { value: "OTHER", label: "Other", },
] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number]["value"];

export const TOTAL_LEAVES_PER_YEAR = 24;

export interface LeaveRequest {
  id: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: LeaveType;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  doctorName?: string;
  doctorEmail?: string;
}

export interface ApplyLeavePayload {
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: LeaveType;
}

export const applyLeave = async (data: ApplyLeavePayload): Promise<LeaveRequest> => {
  const res = await api.post("/doctor/leaves", data);
  return res.data;
};

export const getMyLeaves = async (): Promise<LeaveRequest[]> => {
  const res = await api.get("/doctor/leaves");
  return res.data;
};

export const cancelLeave = async (id: string): Promise<void> => {
  await api.delete(`/doctor/leaves/${id}`);
};

// Admin endpoints
export const getAllLeaves = async (): Promise<LeaveRequest[]> => {
  const res = await api.get("/admin/leaves");
  return res.data;
};

export const reviewLeave = async (
  id: string,
  status: "APPROVED" | "REJECTED"
): Promise<LeaveRequest> => {
  const res = await api.patch(`/admin/leaves/${id}/review`, { status });
  return res.data;
};
