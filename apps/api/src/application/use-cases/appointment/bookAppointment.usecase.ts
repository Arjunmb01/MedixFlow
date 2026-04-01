import {
    IAppointmentRepository,
    CreateAppointmentDTO,
    AppointmentRecord
} from "../../../domain/repositories/IAppointmentRepository";

export class BookAppointmentUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
    ) { }

    async execute(data: CreateAppointmentDTO): Promise<AppointmentRecord> {
        if (!data.patientId || !data.doctorId) {
            throw new Error("Invalid patient or doctor");
        }

        if (!data.slotStart || !data.slotEnd) {
            throw new Error("Invalid slot");
        }

        const now = new Date();
        const year = data.appointmentDate.getUTCFullYear();
        const month = data.appointmentDate.getUTCMonth();
        const day = data.appointmentDate.getUTCDate();
        const [hours, minutes] = data.slotStart.split(":").map(Number);
        
        const appointmentTime = new Date(year, month, day, hours, minutes, 0, 0);

        if (appointmentTime < now) {
            throw new Error("Cannot book an appointment in the past");
        }

        const appointment = await this.appointmentRepo.createWithTransaction(data);

        return appointment;
    }
}