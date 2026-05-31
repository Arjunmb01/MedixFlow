import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IConsultationSessionRepository } from "@/domain/repositories/IConsultationSessionRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { AppError } from "@/shared/errors/AppError";
import { StatusCode } from "@/shared/constants/statusCodes";

export class ConsultationAccessPolicy {
  constructor(
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly sessionRepo: IConsultationSessionRepository,
    private readonly dateTimeService: IDateTimeService
  ) {}

  async assertVideoAppointment(appointmentId: string, userId: string, role: UserRole) {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new AppError("Appointment not found", StatusCode.NOT_FOUND);
    }
    if (appointment.status !== "BOOKED" && appointment.status !== "COMPLETED") {
      throw new AppError("Appointment is not active for consultation", StatusCode.BAD_REQUEST);
    }
    const consultationType = appointment.consultationType ?? "CLINIC";
    if (consultationType !== "VIDEO") {
      throw new AppError("This appointment is not a video consultation", StatusCode.BAD_REQUEST);
    }
    if (role === UserRole.DOCTOR && appointment.doctorId !== userId) {
      throw new AppError("Unauthorized", StatusCode.FORBIDDEN);
    }
    if (role === UserRole.PATIENT && appointment.patientId !== userId) {
      throw new AppError("Unauthorized", StatusCode.FORBIDDEN);
    }
    if (
      !this.dateTimeService.isWithinVideoConsultationWindow(
        appointment.appointmentDate,
        appointment.slotStart,
        appointment.slotEnd
      )
    ) {
      throw new AppError(
        "Consultation is only available within the allowed time window",
        StatusCode.BAD_REQUEST
      );
    }
    return appointment;
  }

  async assertSessionAccess(sessionId: string, userId: string, role: UserRole) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new AppError("Session not found", StatusCode.NOT_FOUND);
    }
    if (session.status === "ENDED" || session.status === "CANCELLED") {
      throw new AppError("Consultation session has ended", StatusCode.BAD_REQUEST);
    }
    if (role === UserRole.DOCTOR && session.doctorId !== userId) {
      throw new AppError("Unauthorized", StatusCode.FORBIDDEN);
    }
    if (role === UserRole.PATIENT && session.patientId !== userId) {
      throw new AppError("Unauthorized", StatusCode.FORBIDDEN);
    }
    return session;
  }

  async assertRoomAccess(roomId: string, userId: string, role: UserRole) {
    const session = await this.sessionRepo.findByRoomId(roomId);
    if (!session) {
      throw new AppError("Room not found", StatusCode.NOT_FOUND);
    }
    if (role === UserRole.DOCTOR && session.doctorId !== userId) {
      throw new AppError("Unauthorized room access", StatusCode.FORBIDDEN);
    }
    if (role === UserRole.PATIENT && session.patientId !== userId) {
      throw new AppError("Unauthorized room access", StatusCode.FORBIDDEN);
    }
    return session;
  }
}
