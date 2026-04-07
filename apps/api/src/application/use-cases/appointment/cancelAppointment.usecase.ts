import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IConsultationRepository } from "@/domain/repositories/IConsultationRepository";

export class CancelAppointmentUseCase {
    constructor(
        private readonly appointmentRepo : IAppointmentRepository,
        private readonly consultationRepo : IConsultationRepository
    ) {}

    async execute (appointmentId : string, patientId : string, reason : string) {
        const appointment = await this.appointmentRepo.findById(appointmentId);

        if(!appointment) throw new Error("Appointment not found");
        
        if(appointment.patientId !== patientId) throw new Error("Unauthorized to cancel to this appointment")
        
        if(appointment.status === "CANCELLED" || appointment.status === "COMPLETED") throw new Error(`Cannot cancel appointment with status ${appointment.status}`);

        const updatedAppointment = await this.appointmentRepo.cancelAppointment(
            appointmentId,
            reason
        )

        await this.consultationRepo.deleteByAppointmentId(appointmentId);

        return updatedAppointment

    }
}