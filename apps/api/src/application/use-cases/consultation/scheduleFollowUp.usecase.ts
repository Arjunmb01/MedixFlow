import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IDateTimeService } from "../../../domain/services/IDateTimeService";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";
import { socketService } from "@/infrastructure/services/SocketService";
import { PaymentMethod } from "@/domain/value-objects/enums/PaymentMethod";

export interface ScheduleFollowUpInput {
    consultationId: string;
    patientId: string;
    doctorId: string;
    scheduledDate: Date;
    time: string;
    type: 'PHYSICAL' | 'VIDEO' | 'PHONE';
    reason?: string;
    notes?: string;
}

export class ScheduleFollowUpUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly dateTimeService: IDateTimeService,
        private readonly sendNotificationUseCase: SendNotificationUseCase
    ) {}

    async execute(input: ScheduleFollowUpInput) {
        // 1. Calculate slot timing (default 15 min for follow-up)
        const startTime = this.dateTimeService.combineDateAndTimeString(input.scheduledDate, input.time);
        
        // Calculate slotEnd (HH:mm)
        const endTimeDate = new Date(startTime.getTime() + 15 * 60000);
        const slotEnd = `${endTimeDate.getHours().toString().padStart(2, '0')}:${endTimeDate.getMinutes().toString().padStart(2, '0')}`;

        // 2. Check for conflicts (clashes)
        const conflict = await this.appointmentRepo.checkConflict({
            patientId: input.patientId,
            doctorId: input.doctorId,
            appointmentDate: input.scheduledDate,
            startTime,
            endTime: endTimeDate
        });

        if (conflict.hasConflict) {
            throw new Error(`Conflict detected: ${conflict.message}`);
        }

        // 3. Create a free Appointment record
        const appointment = await this.appointmentRepo.createWithTransaction({
            patientId: input.patientId,
            doctorId: input.doctorId,
            appointmentDate: input.scheduledDate,
            slotStart: input.time,
            slotEnd: slotEnd,
            startTime,
            endTime: endTimeDate,
            status: "BOOKED",
            paymentStatus: "PAID",
            paymentMethod: PaymentMethod.WALLET, // Marked as WALLET but with 0 amount
            paymentAmount: 0,
            reason: input.reason || `Follow-up for ${input.consultationId}`
        });

        // 4. Create FollowUp record linked to consultation
        const followUp = await this.consultationRepo.scheduleFollowUp({
            consultationId: input.consultationId,
            patientId: input.patientId,
            doctorId: input.doctorId,
            scheduledDate: input.scheduledDate,
            time: input.time,
            type: input.type,
            reason: input.reason,
            notes: input.notes
        });

        // 5. Notify Patient
        await this.sendNotificationUseCase.execute({
            recipientId: input.patientId,
            title: "Follow-up Scheduled",
            message: `Dr. has scheduled a free follow-up visit for you on ${new Date(input.scheduledDate).toLocaleDateString()} at ${input.time}.`,
            type: NotificationType.FOLLOW_UP_SCHEDULED,
            metadata: {
                followUpId: followUp.id,
                consultationId: input.consultationId,
                appointmentId: appointment.id
            }
        });

        // 6. Real-time update
        socketService.emitToUser(input.patientId, "follow_up_scheduled", { ...followUp, appointment });

        return { ...followUp, appointment };
    }
}
