import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class CancelAppointmentUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
    ) {}

    async execute(appointmentId: string, patientId: string, reason: string) {
        const appointment = await this.appointmentRepo.findById(appointmentId);
        
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (appointment.patientId !== patientId) {
            throw new Error("Unauthorized to cancel this appointment");
        }

        if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
            throw new Error(`Cannot cancel appointment with status ${appointment.status}`);
        }

        const updatedAppointment = await this.appointmentRepo.cancelAppointment(appointmentId, reason);
        


        return updatedAppointment;
    }
}
