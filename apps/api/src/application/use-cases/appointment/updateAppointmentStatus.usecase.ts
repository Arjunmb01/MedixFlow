import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";
import { IQueueService } from "@/domain/services/IQueueService";
import { SocketService } from "@/infrastructure/services/SocketService";

export interface UpdateAppointmentStatusInput {
  appointmentId: string;
  status: AppointmentStatus;
}

export class UpdateAppointmentStatusUseCase {
  constructor(
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly queueService: IQueueService,
    private readonly socketService: SocketService
  ) {}

  async execute(input: UpdateAppointmentStatusInput) {
    const { appointmentId, status } = input;

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const updatedAppointment = await this.appointmentRepo.updateStatus(appointmentId, status);

    // If status is final, remove from queue
    const finalStatuses = [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW];
    if (finalStatuses.includes(status)) {
      await this.queueService.removeFromQueue(
        appointment.doctorId,
        appointment.appointmentDate,
        appointmentId
      );

      // Notify queue update
      const updatedQueue = await this.appointmentRepo.getTodaysQueue(appointment.doctorId);
      this.socketService.emitQueueUpdated(appointment.doctorId, appointment.appointmentDate, updatedQueue);
    }

    // Notify status change via socket
    this.socketService.emitStatusChanged(appointment.patientId, appointmentId, status);
    this.socketService.emitStatusChanged(appointment.doctorId, appointmentId, status);

    return updatedAppointment;
  }
}
