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
    public readonly createdAt: Date = new Date()
  ) {}

  public isUpcoming(now: Date): boolean {
    return this.appointmentDate >= now && this.status !== AppointmentStatus.CANCELLED;
  }

  public canBeCancelled(): boolean {
    return this.status !== AppointmentStatus.CANCELLED && this.status !== AppointmentStatus.COMPLETED;
  }
}
