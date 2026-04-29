import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";
import { IDateTimeService } from "@/domain/services/IDateTimeService";

export class RespondToProposalUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async execute(proposalId: string, action: "ACCEPT" | "REJECT", actorId: string) {
        const proposal = await this.appointmentRepo.findProposalById(proposalId);
        if (!proposal) throw new Error("Proposal not found");
        if (proposal.status !== "PENDING") throw new Error(`Proposal is already ${proposal.status}`);

        if (action === "REJECT") {
            await this.appointmentRepo.updateProposalStatus(proposalId, "REJECTED");
            
            // Notify the proposer
            await this.sendNotificationUseCase.execute({
                recipientId: proposal.proposedById,
                title: "Reschedule Proposal Rejected",
                message: `The reschedule proposal for appointment ${proposal.appointmentId} has been rejected.`,
                type: NotificationType.RESCHEDULED,
            });

            return { status: "REJECTED" };
        }

        // action === "ACCEPT"
        const appointment = await this.appointmentRepo.findById(proposal.appointmentId);
        if (!appointment) throw new Error("Appointment not found");

        const now = this.dateTimeService.now();
        const year = proposal.newDate.getUTCFullYear();
        const month = proposal.newDate.getUTCMonth();
        const day = proposal.newDate.getUTCDate();
        const [startH, startM] = proposal.newSlotStart.split(":").map(Number);
        const [endH, endM] = proposal.newSlotEnd.split(":").map(Number);
        
        const startTime = new Date(year, month, day, startH, startM, 0, 0);
        const endTime = new Date(year, month, day, endH, endM, 0, 0);

        try {
            const updated = await this.appointmentRepo.rescheduleAtomic({
                appointmentId: proposal.appointmentId,
                newDate: proposal.newDate,
                slotStart: proposal.newSlotStart,
                slotEnd: proposal.newSlotEnd,
                startTime,
                endTime
            });

            await this.appointmentRepo.updateProposalStatus(proposalId, "ACCEPTED");

            // Notify both
            await this.sendNotificationUseCase.execute({
                recipientId: appointment.doctorId,
                title: "Appointment Rescheduled (Proposal Accepted)",
                message: `The appointment has been rescheduled to ${proposal.newDate.toLocaleDateString()} at ${proposal.newSlotStart}.`,
                type: NotificationType.RESCHEDULED,
            });

            await this.sendNotificationUseCase.execute({
                recipientId: appointment.patientId,
                title: "Appointment Rescheduled (Proposal Accepted)",
                message: `Your appointment has been rescheduled to ${proposal.newDate.toLocaleDateString()} at ${proposal.newSlotStart}.`,
                type: NotificationType.RESCHEDULED,
            });

            return updated;
        } catch (error: any) {
            if (error.message === "SLOT_FULL" || error.message === "PATIENT_ALREADY_HAS_APPOINTMENT") {
                await this.appointmentRepo.updateProposalStatus(proposalId, "EXPIRED");
                throw new Error("The proposed slot is no longer available. Please request a new reschedule.");
            }
            throw error;
        }
    }
}
