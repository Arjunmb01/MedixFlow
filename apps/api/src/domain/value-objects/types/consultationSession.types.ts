export type ConsultationSessionStatus = "WAITING" | "IN_CALL" | "ENDED" | "CANCELLED";
export type ParticipantRole = "DOCTOR" | "PATIENT";

export interface ConsultationRoomState {
  roomId: string;
  sessionId: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  doctorJoined: boolean;
  patientJoined: boolean;
  patientAdmitted: boolean;
  startedAt: string | null;
  status: ConsultationSessionStatus;
}

export interface ConsultationSessionRecord {
  id: string;
  roomId: string;
  appointmentId: string;
  consultationId: string | null;
  doctorId: string;
  patientId: string;
  startedAt: Date | null;
  endedAt: Date | null;
  duration: number | null;
  status: ConsultationSessionStatus;
  summary: string | null;
}

export interface ConsultationParticipantRecord {
  id: string;
  sessionId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: Date | null;
  leftAt: Date | null;
}

export interface ConsultationChatMessageRecord {
  id: string;
  sessionId: string;
  senderId: string;
  senderRole: ParticipantRole;
  message: string;
  createdAt: Date;
}
