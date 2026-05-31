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
  FOLLOW_UP_SCHEDULED = "FOLLOW_UP_SCHEDULED",
  LAB_REPORT_UPLOADED = "LAB_REPORT_UPLOADED",
}

export interface NotificationRecord {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: any;
  createdAt: Date;
}

export interface CreateNotificationInput {
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: any;
}
