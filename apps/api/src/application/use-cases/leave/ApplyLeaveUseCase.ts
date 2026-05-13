import { IDoctorLeaveRepository, CreateLeaveInput } from "@/domain/repositories/IDoctorLeaveRepository";
import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { DoctorLeave } from "@/domain/entities/DoctorLeave";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { CancelAppointmentUseCase } from "../appointment/cancelAppointment.usecase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

export class ApplyLeaveUseCase {
  constructor(
    private readonly leaveRepository: IDoctorLeaveRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase
  ) {}

  async execute(doctorId: string, input: CreateLeaveInput & { suppressConflicts?: boolean }): Promise<DoctorLeave> {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (startDate > endDate) {
      throw new Error("Start date must be before or equal to end date.");
    }
    if (startDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error("Cannot apply for leave in the past.");
    }
    if (!input.reason || input.reason.trim().length < 5) {
      throw new Error("Please provide a valid reason (min 5 characters).");
    }

    // Check for conflicting appointments
    // We filter for BOOKED or PENDING appointments in the date range
    const result = await this.appointmentRepository.getAppointmentsByDoctorId(doctorId, {
      fromDate: startDate,
      toDate: endDate,
      status: AppointmentStatus.BOOKED,
      limit: 100 // Fetch a reasonable amount for cancellation
    });
    const appointments = result.data;
    const total = result.meta.total;

    if (total > 0 && !input.suppressConflicts) {
      throw new Error(`Appointment conflict: You have ${total} appointment(s) scheduled between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}. Please reschedule them before applying for leave.`);
    }

    if (total > 0 && input.suppressConflicts) {
      console.log(`[ApplyLeaveUseCase] Auto-cancelling ${appointments.length} appointments for doctor ${doctorId}`);
      for (const appt of appointments) {
        await this.cancelAppointmentUseCase.execute(
          appt.id, 
          appt.patientId, 
          "Doctor on Leave", 
          false, // refundToWallet (default to original source)
          true   // isSystemAction
        );
      }
    }

    return this.leaveRepository.create(doctorId, { startDate, endDate, reason: input.reason.trim() });
  }
}
