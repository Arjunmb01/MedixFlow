import { AppointmentStatus } from "../value-objects/enums/AppointmentStatus";

export type AppointmentId = string;
export type DoctorId = string;
export type PatientId = string;

export class Appointment {
  constructor(
    public readonly id: AppointmentId,
    public readonly patientId: PatientId,
    public readonly doctorId: DoctorId,
    public readonly appointmentDate: Date,
    public readonly slotStart: string,
    public readonly slotEnd: string,
    public readonly status: AppointmentStatus,
    public readonly reason: string | null = null,
    public readonly notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly expiresAt: Date | null = null,
    public readonly rescheduledToId: string | null = null,
    public readonly lastStatusChangedAt: Date = new Date(),
    public readonly parentAppointmentId: string | null = null
  ) {}

  public static canReschedule(status: AppointmentStatus): boolean {
    return [
      AppointmentStatus.BOOKED,
      AppointmentStatus.PENDING,
      AppointmentStatus.PAYMENT_FAILED_HOLD
    ].includes(status);
  }

  public canBeCancelled(): boolean {
    return [
      AppointmentStatus.BOOKED,
      AppointmentStatus.PENDING,
      AppointmentStatus.PAYMENT_FAILED_HOLD
    ].includes(this.status);
  }

  public isUpcoming(now: Date): boolean {
    return this.appointmentDate >= now && this.status !== AppointmentStatus.CANCELLED;
  }
}
