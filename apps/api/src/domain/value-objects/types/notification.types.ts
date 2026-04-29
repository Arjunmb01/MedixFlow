export enum NotificationType {
  BOOKED = "BOOKED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  PRESCRIPTION = "PRESCRIPTION",
  RESCHEDULED = "RESCHEDULED",
  LAB_TEST = "LAB_TEST",
  RESCHEDULE_REQUEST = "RESCHEDULE_REQUEST",
  RESCHEDULE_PROPOSAL = "RESCHEDULE_PROPOSAL",
  DOCTOR_UNAVAILABLE = "DOCTOR_UNAVAILABLE",
  REASSIGNED = "REASSIGNED",
}

export interface NotificationRecord {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
}
