import { IConsultationSessionRepository } from "@/domain/repositories/IConsultationSessionRepository";
import { ConsultationAccessPolicy } from "@/application/services/ConsultationAccessPolicy";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { SocketService } from "@/infrastructure/services/SocketService";
import { ParticipantRole } from "@/domain/value-objects/types/consultationSession.types";

export class SendConsultationChatUseCase {
  constructor(
    private readonly accessPolicy: ConsultationAccessPolicy,
    private readonly sessionRepo: IConsultationSessionRepository,
    private readonly socketService: SocketService
  ) {}

  async execute(sessionId: string, userId: string, role: UserRole, message: string) {
    const session = await this.accessPolicy.assertSessionAccess(sessionId, userId, role);
    const senderRole: ParticipantRole = role === UserRole.DOCTOR ? "DOCTOR" : "PATIENT";

    const chat = await this.sessionRepo.addChatMessage({
      sessionId,
      senderId: userId,
      senderRole,
      message: message.trim(),
    });

    this.socketService.emitToRoom(session.roomId, "consultation-chat", chat);
    return chat;
  }
}
