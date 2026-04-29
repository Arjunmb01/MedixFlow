import { IAppointmentRepository, ReassignInput } from "@/domain/repositories/IAppointmentRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

export class ReassignAppointmentUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase
    ) {}

    async execute(input: ReassignInput) {
        const { appointmentId, newDoctorId, reassignedBy, reason } = input;

        // 1. Fetch original to get patient info
        const original = await this.appointmentRepo.findById(appointmentId);
        if (!original) throw new Error("Appointment not found");

        // 2. Perform atomic reassignment
        const newAppointment = await this.appointmentRepo.reassignAtomic(input);

        // 3. Notify Patient
        await this.sendNotificationUseCase.execute({
            recipientId: original.patientId,
            title: "Appointment Reassigned",
            message: `Your appointment has been reassigned to a new provider. Your new appointment is on ${newAppointment.appointmentDate.toLocaleDateString()} at ${newAppointment.slotStart}.`,
            type: NotificationType.REASSIGNED,
        });

        // 4. Notify New Doctor
        await this.sendNotificationUseCase.execute({
            recipientId: newDoctorId,
            title: "New Appointment Assigned",
            message: `A new appointment has been reassigned to you for patient ${original.patientId}.`,
            type: NotificationType.REASSIGNED,
        });

        return newAppointment;
    }
}
