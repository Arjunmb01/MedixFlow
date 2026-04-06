import { AppointmentWithPatient, IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { DateTimeService } from "@/domain/services/DateTimeService";


export class GetDoctorAppointmentsUseCase {
  constructor(private readonly appointmentRepo: IAppointmentRepository) {}

  async execute(doctorId: string): Promise<AppointmentWithPatient[]> {
    const appointments = await this.appointmentRepo.getUpcomingByDoctorId(doctorId);

    return appointments.filter(app =>
      DateTimeService.isUpcoming(app.appointmentDate, app.slotStart)
    );
  }
}