import api from "../../core/api/axios";

export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  type: "BOOKED" | "CANCELLED" | "COMPLETED" | "PRESCRIPTION" | "RESCHEDULED";
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export const getNotifications = async (limit: number = 10, offset: number = 0): Promise<PaginatedResponse<NotificationDTO>> => {
  const { data } = await api.get("/notifications", {
    params: { limit, offset },
  });
  return data;
};

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await api.get("/notifications/unread-count");
  return data.count;
};

export const markAsRead = async (id?: string): Promise<void> => {
  const url = id ? `/notifications/mark-read/${id}` : "/notifications/mark-read";
  await api.post(url, {});
};

export const deleteAllNotifications = async (): Promise<void> => {
  await api.delete("/notifications");
};
