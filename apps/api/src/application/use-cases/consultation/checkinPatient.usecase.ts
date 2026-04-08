import { IDateTimeService } from "@/domain/services/IDateTimeService";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";
import app from "@/app";

export class CheckinPatientUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly consultationRepo: IConsultationRepository,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async execute (appointmentId : string,patientId : string) {
        const appointment = await this.appointmentRepo.findById(appointmentId)

        if(!appointment) throw new Error("Appointment not found")

        if(appointment.patientId !== patientId) throw new Error("Unauthorized")

        if(!this.dateTimeService.isWithinCheckInWindow(appointment.appointmentDate,appointment.slotStart)) {
            throw new Error ("Check-in is only allowed within 15 minutes before the appointment Time")
        }

        const existing = await this.consultationRepo.findByAppointmentId(appointmentId)
        if(existing) throw new Error ("Already Checked in")

        await this.appointmentRepo.updateStatus(appointmentId, "CONFIRMED")

        return this.consultationRepo.create({
            appointmentId,
            doctorId : appointment.doctorId,
            patientId : appointment.patientId,
        })
    }
}
