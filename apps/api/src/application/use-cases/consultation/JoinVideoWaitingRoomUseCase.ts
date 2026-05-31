import { randomUUID } from "crypto";
import { IConsultationRepository } from "@/domain/repositories/IConsultationRepository";
import { IConsultationSessionRepository } from "@/domain/repositories/IConsultationSessionRepository";
import { IConsultationRoomService } from "@/domain/services/IConsultationRoomService";
import { ConsultationAccessPolicy } from "@/application/services/ConsultationAccessPolicy";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { AppError } from "@/shared/errors/AppError";
import { StatusCode } from "@/shared/constants/statusCodes";

export class JoinVideoWaitingRoomUseCase {
  constructor(
    private readonly accessPolicy: ConsultationAccessPolicy,
    private readonly consultationRepo: IConsultationRepository,
    private readonly sessionRepo: IConsultationSessionRepository,
    private readonly roomService: IConsultationRoomService
  ) {}

  async execute(appointmentId: string, patientId: string) {
    const appointment = await this.accessPolicy.assertVideoAppointment(
      appointmentId,
      patientId,
      UserRole.PATIENT
    );

    let consultationId: string;
    const existingConsultation = await this.consultationRepo.findByAppointmentId(appointmentId);
    if (existingConsultation) {
      consultationId = existingConsultation.id;
    } else {
      const created = await this.consultationRepo.create({
        appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
      });
      consultationId = created.id;
    }

    let session = await this.sessionRepo.findByAppointmentId(appointmentId);
    if (!session) {
      const roomId = `room-${randomUUID()}`;
      const locked = await this.roomService.lockAppointment(appointmentId, roomId);
      if (!locked) {
        session = await this.sessionRepo.findByAppointmentId(appointmentId);
        if (!session) {
          throw new AppError("Could not join consultation room", StatusCode.CONFLICT);
        }
      } else {
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
          doctorJoined: false,
          patientJoined: true,
          patientAdmitted: false,
          startedAt: null,
          status: "WAITING",
        });
      }
    } else {
      await this.roomService.updateRoom(session.roomId, { patientJoined: true });
    }

    await this.sessionRepo.upsertParticipant({
      sessionId: session.id,
      userId: patientId,
      role: "PATIENT",
      joinedAt: new Date(),
    });

    const room = await this.roomService.getRoom(session.roomId);

    return {
      session,
      room,
      consultationId,
      appointment,
    };
  }
}
