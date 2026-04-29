import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";

export interface CheckRescheduleConflictInput {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    newDate: Date;
    slotStart: string;
    slotEnd: string;
}

export class CheckRescheduleConflictUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async execute(input: CheckRescheduleConflictInput) {
        const { appointmentId, patientId, doctorId, newDate, slotStart, slotEnd } = input;

        // Calculate startTime/endTime
        const year = newDate.getUTCFullYear();
        const month = newDate.getUTCMonth();
        const day = newDate.getUTCDate();
        const [startH, startM] = slotStart.split(":").map(Number);
        const [endH, endM] = slotEnd.split(":").map(Number);
        
        const startTime = new Date(year, month, day, startH, startM, 0, 0);
        const endTime = new Date(year, month, day, endH, endM, 0, 0);

        const now = this.dateTimeService.now();
        if (startTime < now) {
            return {
                hasConflict: true,
                type: 'PAST_TIME',
                message: "Cannot reschedule to a past date/time."
            };
        }

        return await this.appointmentRepo.checkConflict({
            patientId,
            doctorId,
            appointmentDate: newDate,
            startTime,
            endTime,
            excludeAppointmentId: appointmentId
        });
    }
}
