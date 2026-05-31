import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IConsultationRepository } from "@/domain/repositories/IConsultationRepository";
import { IConsultationSessionRepository } from "@/domain/repositories/IConsultationSessionRepository";
import { IConsultationRoomService } from "@/domain/services/IConsultationRoomService";
import { ConsultationAccessPolicy } from "@/application/services/ConsultationAccessPolicy";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { SocketService } from "@/infrastructure/services/SocketService";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

export class EndVideoConsultationUseCase {
  constructor(
    private readonly accessPolicy: ConsultationAccessPolicy,
    private readonly sessionRepo: IConsultationSessionRepository,
    private readonly consultationRepo: IConsultationRepository,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly roomService: IConsultationRoomService,
    private readonly socketService: SocketService,
    private readonly sendNotification: SendNotificationUseCase
  ) {}

  async execute(sessionId: string, doctorId: string, summary?: string) {
    const session = await this.accessPolicy.assertSessionAccess(
      sessionId,
      doctorId,
      UserRole.DOCTOR
    );

    const endedAt = new Date();
    const duration =
      session.startedAt != null
        ? Math.max(0, Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000))
        : 0;

    const updated = await this.sessionRepo.updateStatus(session.id, "ENDED", {
      endedAt,
      duration,
      summary,
    });

    await this.roomService.setRoomStatus(session.roomId, "ENDED");
    await this.roomService.cleanupRoom(
      session.roomId,
      session.appointmentId,
      session.doctorId,
      session.patientId
    );

    await this.sessionRepo.upsertParticipant({
      sessionId: session.id,
      userId: doctorId,
      role: "DOCTOR",
      leftAt: endedAt,
    });
    await this.sessionRepo.upsertParticipant({
      sessionId: session.id,
      userId: session.patientId,
      role: "PATIENT",
      leftAt: endedAt,
    });

    if (session.consultationId) {
      const consultation = await this.consultationRepo.findById(session.consultationId);
      if (consultation && consultation.status === "IN_PROGRESS") {
        await this.consultationRepo.updateStatus(session.consultationId, "COMPLETED");
      }
    }

    await this.appointmentRepo.updateStatus(session.appointmentId, "COMPLETED");

    this.socketService.emitToRoom(session.roomId, "consultation-ended", {
      sessionId: session.id,
      duration,
      summary: summary ?? null,
    });

    await this.sendNotification.execute({
      recipientId: session.patientId,
      title: "Consultation Ended",
      message: "Your video consultation has ended. View your records in the app.",
      type: NotificationType.COMPLETED,
    });

    return updated;
  }
}
