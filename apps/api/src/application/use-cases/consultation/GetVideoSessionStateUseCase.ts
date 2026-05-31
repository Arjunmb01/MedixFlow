import { IConsultationSessionRepository } from "@/domain/repositories/IConsultationSessionRepository";
import { IConsultationRoomService } from "@/domain/services/IConsultationRoomService";
import { ConsultationAccessPolicy } from "@/application/services/ConsultationAccessPolicy";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class GetVideoSessionStateUseCase {
  constructor(
    private readonly accessPolicy: ConsultationAccessPolicy,
    private readonly sessionRepo: IConsultationSessionRepository,
    private readonly roomService: IConsultationRoomService
  ) {}

  async execute(params: { appointmentId?: string; sessionId?: string; userId: string; role: UserRole }) {
    let session = null;
    if (params.appointmentId) {
      await this.accessPolicy.assertVideoAppointment(
        params.appointmentId,
        params.userId,
        params.role
      );
      session = await this.sessionRepo.findByAppointmentId(params.appointmentId);
    } else if (params.sessionId) {
      session = await this.accessPolicy.assertSessionAccess(
        params.sessionId,
        params.userId,
        params.role
      );
    } else {
      session = await this.sessionRepo.findActiveByUserId(params.userId);
    }

    if (!session) return { session: null, room: null, chat: [] };

    const room = await this.roomService.getRoom(session.roomId);
    const chat = await this.sessionRepo.getChatMessages(session.id, 50);

    return { session, room, chat };
  }
}
