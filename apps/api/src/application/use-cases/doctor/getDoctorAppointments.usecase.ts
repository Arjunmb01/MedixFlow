import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { DoctorAppointmentFilter } from "@/domain/value-objects/types/appointment.types";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";
import { IDateTimeService } from "@/domain/services/IDateTimeService";

export class GetDoctorAppointmentsUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly dateTimeService: IDateTimeService
    ) {}

async execute(doctorId: string, filter?: DoctorAppointmentFilter) {
  const { appointments, total } = await this.appointmentRepo.getAppointmentsByDoctorId(doctorId, filter);

  const { page = 1, limit = 10 } = filter || {};

  return {
    data: appointments.map((appt) => ({
      id: appt.id,
      status: appt.status as AppointmentStatus,
      appointmentDate: appt.appointmentDate,
      slotStart: appt.slotStart,
      slotEnd: appt.slotEnd,
      reason: appt.reason,
      notes: appt.notes,
      patient: {
        id: appt.patient?.id,
        patientId: appt.patient?.patientId,
        firstName: appt.patient?.firstName,
        lastName: appt.patient?.lastName,
        name: `${appt.patient?.firstName} ${appt.patient?.lastName}`,
        email: appt.patient?.email,
        phone: appt.patient?.phone
      },
      consultation: appt.consultation
        ? {
            id: appt.consultation.id,
            status: appt.consultation.status,
            prescription: appt.consultation.prescription 
              ? {
                  id: appt.consultation.prescription.id,
                  instructions: appt.consultation.prescription.instructions,
                  medicines: appt.consultation.prescription.medicines.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration
                  }))
                }
              : null
          }
        : null,
      paymentStatus: appt.paymentStatus,
      queueNumber: appt.queueNumber,
      createdAt: appt.createdAt,
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };
}
}
