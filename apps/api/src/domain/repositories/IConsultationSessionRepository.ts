import {
  ConsultationChatMessageRecord,
  ConsultationParticipantRecord,
  ConsultationSessionRecord,
  ConsultationSessionStatus,
  ParticipantRole,
} from "../value-objects/types/consultationSession.types";

export interface IConsultationSessionRepository {
  findByAppointmentId(appointmentId: string): Promise<ConsultationSessionRecord | null>;
  findByRoomId(roomId: string): Promise<ConsultationSessionRecord | null>;
  findById(id: string): Promise<ConsultationSessionRecord | null>;
  findActiveByUserId(userId: string): Promise<ConsultationSessionRecord | null>;
  createSession(input: {
    roomId: string;
    appointmentId: string;
    consultationId?: string;
    doctorId: string;
    patientId: string;
  }): Promise<ConsultationSessionRecord>;
  updateStatus(
    sessionId: string,
    status: ConsultationSessionStatus,
    extra?: { startedAt?: Date; endedAt?: Date; duration?: number; summary?: string }
  ): Promise<ConsultationSessionRecord>;
  upsertParticipant(input: {
    sessionId: string;
    userId: string;
    role: ParticipantRole;
    joinedAt?: Date;
    leftAt?: Date;
    socketId?: string;
  }): Promise<ConsultationParticipantRecord>;
  getParticipants(sessionId: string): Promise<ConsultationParticipantRecord[]>;
  addChatMessage(input: {
    sessionId: string;
    senderId: string;
    senderRole: ParticipantRole;
    message: string;
  }): Promise<ConsultationChatMessageRecord>;
  getChatMessages(sessionId: string, limit?: number): Promise<ConsultationChatMessageRecord[]>;
  linkConsultation(sessionId: string, consultationId: string): Promise<void>;
}
