import { PrismaClient } from "@prisma/client";
import { IConsultationSessionRepository } from "@/domain/repositories/IConsultationSessionRepository";
import {
  ConsultationChatMessageRecord,
  ConsultationParticipantRecord,
  ConsultationSessionRecord,
  ConsultationSessionStatus,
  ParticipantRole,
} from "@/domain/value-objects/types/consultationSession.types";

export class ConsultationSessionRepository implements IConsultationSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toSession(row: {
    id: string;
    roomId: string;
    appointmentId: string;
    consultationId: string | null;
    doctorId: string;
    patientId: string;
    startedAt: Date | null;
    endedAt: Date | null;
    duration: number | null;
    status: string;
    summary: string | null;
  }): ConsultationSessionRecord {
    return {
      id: row.id,
      roomId: row.roomId,
      appointmentId: row.appointmentId,
      consultationId: row.consultationId,
      doctorId: row.doctorId,
      patientId: row.patientId,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      duration: row.duration,
      status: row.status as ConsultationSessionStatus,
      summary: row.summary,
    };
  }

  async findByAppointmentId(appointmentId: string) {
    const row = await this.prisma.consultationSession.findUnique({ where: { appointmentId } });
    return row ? this.toSession(row) : null;
  }

  async findByRoomId(roomId: string) {
    const row = await this.prisma.consultationSession.findUnique({ where: { roomId } });
    return row ? this.toSession(row) : null;
  }

  async findById(id: string) {
    const row = await this.prisma.consultationSession.findUnique({ where: { id } });
    return row ? this.toSession(row) : null;
  }

  async findActiveByUserId(userId: string) {
    const row = await this.prisma.consultationSession.findFirst({
      where: {
        status: { in: ["WAITING", "IN_CALL"] },
        OR: [{ doctorId: userId }, { patientId: userId }],
      },
      orderBy: { createdAt: "desc" },
    });
    return row ? this.toSession(row) : null;
  }

  async createSession(input: {
    roomId: string;
    appointmentId: string;
    consultationId?: string;
    doctorId: string;
    patientId: string;
  }) {
    const row = await this.prisma.consultationSession.create({
      data: {
        roomId: input.roomId,
        appointmentId: input.appointmentId,
        consultationId: input.consultationId,
        doctorId: input.doctorId,
        patientId: input.patientId,
        status: "WAITING",
        participants: {
          create: [
            { userId: input.doctorId, role: "DOCTOR" },
            { userId: input.patientId, role: "PATIENT" },
          ],
        },
      },
    });
    return this.toSession(row);
  }

  async updateStatus(
    sessionId: string,
    status: ConsultationSessionStatus,
    extra?: { startedAt?: Date; endedAt?: Date; duration?: number; summary?: string }
  ) {
    const row = await this.prisma.consultationSession.update({
      where: { id: sessionId },
      data: { status, ...extra },
    });
    return this.toSession(row);
  }

  async upsertParticipant(input: {
    sessionId: string;
    userId: string;
    role: ParticipantRole;
    joinedAt?: Date;
    leftAt?: Date;
    socketId?: string;
  }) {
    const row = await this.prisma.consultationParticipant.upsert({
      where: { sessionId_userId: { sessionId: input.sessionId, userId: input.userId } },
      create: {
        sessionId: input.sessionId,
        userId: input.userId,
        role: input.role,
        joinedAt: input.joinedAt,
        leftAt: input.leftAt,
        socketId: input.socketId,
      },
      update: {
        joinedAt: input.joinedAt,
        leftAt: input.leftAt,
        socketId: input.socketId,
      },
    });
    return row as ConsultationParticipantRecord;
  }

  async getParticipants(sessionId: string) {
    return this.prisma.consultationParticipant.findMany({ where: { sessionId } });
  }

  async addChatMessage(input: {
    sessionId: string;
    senderId: string;
    senderRole: ParticipantRole;
    message: string;
  }) {
    return this.prisma.consultationChatMessage.create({ data: input });
  }

  async getChatMessages(sessionId: string, limit = 100) {
    return this.prisma.consultationChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async linkConsultation(sessionId: string, consultationId: string) {
    await this.prisma.consultationSession.update({
      where: { id: sessionId },
      data: { consultationId },
    });
  }
}
