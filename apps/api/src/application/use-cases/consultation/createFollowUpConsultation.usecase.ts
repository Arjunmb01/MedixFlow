import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";
import { IDateTimeService } from "../../../domain/services/IDateTimeService";
import { AppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";

export interface CreateFollowUpInput {
    originalConsultationId: string;
    newDate: Date;
    slotStart: string;
    slotEnd: string;
    reason?: string;
}

export class CreateFollowUpConsultationUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly consultationRepo: IConsultationRepository,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async execute(input: CreateFollowUpInput) {
        const original = await this.consultationRepo.findById(input.originalConsultationId);
        if (!original) throw new Error("Original consultation not found");

        if (original.status !== "COMPLETED") {
            throw new Error("Follow-up can only be created for completed consultations");
        }

        // Check if within 21 days (max allowed follow-up period based on user feedback)
        const daysSinceCompletion = this.dateTimeService.getDaysDifference(original.completedAt!, this.dateTimeService.now());
        if (daysSinceCompletion > 21) {
            throw new Error("Free follow-up period has expired (max 21 days)");
        }

        // Create the appointment (mark as PAID and BOOKED since it's free)
        const startTime = this.dateTimeService.combineDateAndTimeString(input.newDate, input.slotStart);
        const endTime = this.dateTimeService.combineDateAndTimeString(input.newDate, input.slotEnd);

        // Check for conflicts
        const conflict = await this.appointmentRepo.checkConflict({
            patientId: original.patientId,
            doctorId: original.doctorId,
            appointmentDate: input.newDate,
            startTime,
            endTime
        });

        if (conflict.hasConflict) {
            throw new Error(conflict.message);
        }

        // Use a transaction-like approach or just separate calls if bookAtomic doesn't support manual overrides
        // For simplicity and since we follow Clean Architecture, we'll assume the repository can handle this.
        // We'll use createWithTransaction or similar if available, otherwise manual.
        
        const appointment = await this.appointmentRepo.createWithTransaction({
            patientId: original.patientId,
            doctorId: original.doctorId,
            appointmentDate: input.newDate,
            slotStart: input.slotStart,
            slotEnd: input.slotEnd,
            startTime,
            endTime,
            status: "BOOKED",
            paymentStatus: "PAID",
            paymentMethod: PaymentMethod.WALLET, // Or a new "FREE" method if added, but WALLET with 0 works
            paymentAmount: 0,
            reason: input.reason || `Follow-up for consultation ${original.id}`
        });

        // Create the consultation
        const followUpConsultation = await this.consultationRepo.create({
            appointmentId: appointment.id,
            doctorId: original.doctorId,
            patientId: original.patientId,
            parentConsultationId: original.id,
            followUpExpiry: this.dateTimeService.addDays(this.dateTimeService.now(), 15) // Follow-up itself has an expiry
        });

        return followUpConsultation;
    }
}
