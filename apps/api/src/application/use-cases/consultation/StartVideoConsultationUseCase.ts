import { randomUUID } from "crypto";
import { IConsultationRepository } from "@/domain/repositories/IConsultationRepository";
import { IConsultationSessionRepository } from "@/domain/repositories/IConsultationSessionRepository";
import { IConsultationRoomService } from "@/domain/services/IConsultationRoomService";
import { ConsultationAccessPolicy } from "@/application/services/ConsultationAccessPolicy";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { AppError } from "@/shared/errors/AppError";
import { StatusCode } from "@/shared/constants/statusCodes";
import { SocketService } from "@/infrastructure/services/SocketService";

export class StartVideoConsultationUseCase {
  constructor(
    private readonly accessPolicy: ConsultationAccessPolicy,
    private readonly consultationRepo: IConsultationRepository,
    private readonly sessionRepo: IConsultationSessionRepository,
    private readonly roomService: IConsultationRoomService,
    private readonly socketService: SocketService
  ) {}

  async execute(appointmentId: string, doctorId: string, admitPatient = true) {
    const appointment = await this.accessPolicy.assertVideoAppointment(
      appointmentId,
      doctorId,
      UserRole.DOCTOR
    );

    let consultationId: string;
    let consultationStatus: string | undefined;
    const existingConsultation = await this.consultationRepo.findByAppointmentId(appointmentId);
    if (existingConsultation) {
      consultationId = existingConsultation.id;
      consultationStatus = existingConsultation.status;
    } else {
      const created = await this.consultationRepo.create({
        appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
      });
      consultationId = created.id;
      consultationStatus = created.status;
    }

    if (consultationStatus === "WAITING") {
      await this.consultationRepo.updateStatus(consultationId, "IN_PROGRESS");
    }

    let session = await this.sessionRepo.findByAppointmentId(appointmentId);
    if (!session) {
      const roomId = `room-${randomUUID()}`;
      await this.roomService.lockAppointment(appointmentId, roomId);
      session = await this.sessionRepo.createSession({
        roomId,
        appointmentId,
        consultationId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
      });
      await this.roomService.createRoom({
        roomId,
        sessionId: session.id,
        appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        doctorJoined: true,
        patientJoined: false,
        patientAdmitted: false,
        startedAt: null,
        status: "WAITING",
      });
    }

    const startedAt = new Date();
    const roomPatch = {
      doctorJoined: true,
      patientAdmitted: admitPatient,
      ...(admitPatient
        ? { status: "IN_CALL" as const, startedAt: startedAt.toISOString() }
        : {}),
    };

    const room = await this.roomService.updateRoom(session.roomId, roomPatch);

    if (admitPatient) {
      session = await this.sessionRepo.updateStatus(session.id, "IN_CALL", { startedAt });
      this.socketService.emitToRoom(session.roomId, "consultation-started", {
        roomId: session.roomId,
        sessionId: session.id,
        startedAt: startedAt.toISOString(),
      });
      this.socketService.emitToUser(appointment.patientId, "patient-admitted", {
        roomId: session.roomId,
        sessionId: session.id,
      });
    } else {
      this.socketService.emitToRoom(session.roomId, "waiting-room-update", {
        doctorJoined: true,
        patientAdmitted: false,
      });
    }

    await this.sessionRepo.upsertParticipant({
      sessionId: session.id,
      userId: doctorId,
      role: "DOCTOR",
      joinedAt: new Date(),
    });

    return { session, room, consultation: { id: consultationId } };
  }
}
