import { id } from "zod/locales";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { Consultation } from "@/domain/entities/Consultation";

export class GetDoctorAppointmentsUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

async execute(doctorId: string) {
  const appointments = await this.appointmentRepo.getAppointmentsByDoctorId(doctorId);

  return appointments.map((appt) => ({
    id: appt.id,
    status: appt.status,

    appointmentDate: appt.appointmentDate,
    slotStart: appt.slotStart,

    patient: {
      id: appt.patient?.id,
      name: `${appt.patient?.firstName} ${appt.patient?.lastName}`,
      email: appt.patient?.email,
    },

    consultation: appt.consultation
      ? {
          status: appt.consultation.status,
        }
      : null,

    createdAt: appt.createdAt,
  }));
}
}
