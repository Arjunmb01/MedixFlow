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

    const result = await this.appointmentRepo.getAppointmentsByDoctorId(doctorId, filter);
    let { appointments, total } = result;

    if (filter?.isUpcoming === undefined) {
      appointments = appointments.filter(app => 
        !this.dateTimeService.isUpcoming(app.appointmentDate, app.slotStart)
      );
      total = appointments.length;
    }

    return {
      data: appointments,
      meta: {
        total,
        page: filter?.page || 1,
        limit: filter?.limit || 10,
        totalPages: Math.ceil(total / (filter?.limit || 10))
      }
    };
  }
}