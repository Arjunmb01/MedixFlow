import { IConsultationSessionRepository } from "@/domain/repositories/IConsultationSessionRepository";
import { IConsultationRoomService } from "@/domain/services/IConsultationRoomService";
import { ConsultationAccessPolicy } from "@/application/services/ConsultationAccessPolicy";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { SocketService } from "@/infrastructure/services/SocketService";

export class AdmitPatientUseCase {
  constructor(
    private readonly accessPolicy: ConsultationAccessPolicy,
    private readonly sessionRepo: IConsultationSessionRepository,
    private readonly roomService: IConsultationRoomService,
    private readonly socketService: SocketService
  ) {}

  async execute(sessionId: string, doctorId: string) {
    const session = await this.accessPolicy.assertSessionAccess(
      sessionId,
      doctorId,
      UserRole.DOCTOR
    );

    const startedAt = new Date();
    await this.roomService.updateRoom(session.roomId, {
      patientAdmitted: true,
      status: "IN_CALL",
      startedAt: startedAt.toISOString(),
    });

    const updated = await this.sessionRepo.updateStatus(session.id, "IN_CALL", {
      startedAt,
    });

    this.socketService.emitToRoom(session.roomId, "consultation-started", {
      roomId: session.roomId,
      sessionId: session.id,
      startedAt: startedAt.toISOString(),
    });
    this.socketService.emitToUser(session.patientId, "patient-admitted", {
      roomId: session.roomId,
      sessionId: session.id,
    });

    return updated;
  }
}
