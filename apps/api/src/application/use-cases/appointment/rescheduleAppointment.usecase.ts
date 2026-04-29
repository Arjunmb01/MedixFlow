import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";
import { SchedulingPolicy } from "@/domain/services/SchedulingPolicy";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

export type RescheduleCallerRole = "patient" | "doctor" | "admin";

export interface RescheduleInput {
    appointmentId: string;
    callerId: string;
    callerRole: RescheduleCallerRole;
    newDate: Date;
    slotStart: string;
    slotEnd: string;
}

export class RescheduleAppointmentUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly schedulingPolicy: SchedulingPolicy,
        private readonly dateTimeService: IDateTimeService,
        private readonly sendNotificationUseCase: SendNotificationUseCase
    ) {}

    async execute(input: RescheduleInput) {
        const { appointmentId, callerId, callerRole, newDate, slotStart, slotEnd } = input;

        const appointment = await this.appointmentRepo.findById(appointmentId);
        if (!appointment) throw new Error("Appointment not found");

        // Permission checks
        if (callerRole === "patient" && appointment.patientId !== callerId) {
            throw new Error("Unauthorized: you can only reschedule your own appointments");
        }
        if (callerRole === "doctor" && appointment.doctorId !== callerId) {
            throw new Error("Unauthorized: you can only reschedule appointments assigned to you");
        }

        // Status guard
        if (!["BOOKED", "PENDING", "PAYMENT_FAILED_HOLD"].includes(appointment.status)) {
            throw new Error(`Cannot reschedule an appointment with status ${appointment.status}`);
        }

        // 2-hour cutoff rule for patients
        const now = this.dateTimeService.now();
        if (appointment.startTime && callerRole === "patient") {
            const timeUntilAppointment = new Date(appointment.startTime).getTime() - now.getTime();
            const twoHoursInMs = 2 * 60 * 60 * 1000;
            if (timeUntilAppointment < twoHoursInMs) {
                throw new Error("Rescheduling is only allowed at least 2 hours before the appointment start time.");
            }
        }

        // If Doctor or Admin initiates, we might want to "propose" instead of "forcing" 
        // unless they explicitly choose to force. For now, let's implement the proposal flow 
        // if the caller is a Doctor and it's not a direct slot change.
        
        if (callerRole === "doctor") {
            // Create a proposal
            const proposal = await this.appointmentRepo.createRescheduleProposal({
                appointmentId,
                proposedById: callerId,
                proposedByRole: callerRole.toUpperCase(),
                newDate,
                newSlotStart: slotStart,
                newSlotEnd: slotEnd,
                reason: "Doctor requested rescheduling",
                expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24h expiry
            });

            // Notify Patient about the proposal
            await this.sendNotificationUseCase.execute({
                recipientId: appointment.patientId,
                title: "Reschedule Proposed",
                message: `Your doctor has proposed to reschedule your appointment to ${newDate.toLocaleDateString()} at ${slotStart}. Please accept or reject this proposal.`,
                type: NotificationType.RESCHEDULE_PROPOSAL,
            });

            return { status: "PROPOSED", proposalId: proposal.id };
        }

        // Calculate new startTime/endTime
        const year = newDate.getUTCFullYear();
        const month = newDate.getUTCMonth();
        const day = newDate.getUTCDate();
        const [startH, startM] = slotStart.split(":").map(Number);
        const [endH, endM] = slotEnd.split(":").map(Number);
        
        const startTime = new Date(year, month, day, startH, startM, 0, 0);
        const endTime = new Date(year, month, day, endH, endM, 0, 0);

        if (startTime < now) {
            throw new Error("Cannot reschedule to a past date/time");
        }

        // Atomic check and update
        try {
            const updatedAppointment = await this.appointmentRepo.rescheduleAtomic({
                appointmentId,
                newDate,
                slotStart,
                slotEnd,
                startTime,
                endTime
            });

            // Notify Doctor
            await this.sendNotificationUseCase.execute({
                recipientId: appointment.doctorId,
                title: "Appointment Rescheduled",
                message: `The appointment with patient ${appointment.patientId} has been rescheduled to ${newDate.toLocaleDateString()} at ${slotStart}.`,
                type: NotificationType.RESCHEDULED,
            });

            // Notify Patient
            await this.sendNotificationUseCase.execute({
                recipientId: appointment.patientId,
                title: "Appointment Rescheduled",
                message: `Your appointment has been successfully rescheduled to ${newDate.toLocaleDateString()} at ${slotStart}.`,
                type: NotificationType.RESCHEDULED,
            });

            return updatedAppointment;
        } catch (error: any) {
            if (error.message === "PATIENT_ALREADY_HAS_APPOINTMENT") {
                throw new Error("You already have another appointment scheduled at this time. Please choose another available slot.");
            }
            if (error.message === "SLOT_FULL") {
                throw new Error("Selected slot is no longer available. Please choose another slot.");
            }
            throw error;
        }
    }
}
