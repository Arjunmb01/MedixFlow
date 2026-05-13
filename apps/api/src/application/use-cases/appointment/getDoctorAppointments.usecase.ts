import { AppointmentWithPatient, IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";
import { DoctorAppointmentFilter } from "@/domain/value-objects/types/appointment.types";



export class GetDoctorAppointmentsUseCase {
  constructor(
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly dateTimeService: IDateTimeService
  ) {}

  async execute(doctorId: string, filter?: DoctorAppointmentFilter): Promise<{ data: AppointmentWithPatient[]; meta: any }> {
    if (!doctorId) throw new Error("Doctor ID is required");

    await this.appointmentRepo.markPastAppointmentsAsNotAttended();

    const result = await this.appointmentRepo.getAppointmentsByDoctorId(doctorId, filter);
    let appointments = result.data;
    let total = result.meta.total;

    if (filter?.isUpcoming === undefined) {
      appointments = appointments.filter((app: AppointmentWithPatient) => 
        !this.dateTimeService.isUpcoming(app.appointmentDate, app.slotStart)
      );
      total = appointments.length;
    }

    return {
      data: appointments,
      meta: {
        total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: Math.ceil(total / result.meta.limit)
      }
    };
  }
}
