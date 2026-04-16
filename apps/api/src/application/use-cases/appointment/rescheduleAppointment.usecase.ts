import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";
import { SchedulingPolicy } from "@/domain/services/SchedulingPolicy";

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
        private readonly dateTimeService: IDateTimeService
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
        // admin has no restriction

        // Status guard
        if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
            throw new Error(`Cannot reschedule an appointment with status ${appointment.status}`);
        }

        // New slot must not be in the past
        const now = this.dateTimeService.now();
        const year = newDate.getUTCFullYear();
        const month = newDate.getUTCMonth();
        const day = newDate.getUTCDate();
        const [hours, minutes] = slotStart.split(":").map(Number);
        const newSlotTime = new Date(year, month, day, hours, minutes, 0, 0);

        if (newSlotTime < now) {
            throw new Error("Cannot reschedule to a past date/time");
        }

        // Capacity check — exclude this appointment itself from the count
        const schedule = await this.appointmentRepo.getDoctorSchedule(appointment.doctorId, newDate.getDay());
        const capacity = schedule?.slotCapacity ?? (schedule ? this.schedulingPolicy.calculateSlotCapacity(schedule.slotDurationMinutes) : 5);

        const activeBookings = await this.appointmentRepo.countActiveBookings(appointment.doctorId, newDate, slotStart);
        // The current appointment may already be counted (if same doctor+slot), don't block if only self
        const effectiveBookings = (
            appointment.slotStart === slotStart &&
            new Date(appointment.appointmentDate).toDateString() === newDate.toDateString()
        ) ? Math.max(0, activeBookings - 1) : activeBookings;

        if (effectiveBookings >= capacity) {
            throw new Error(`Slot is full (capacity: ${capacity} patients)`);
        }

        const existingPatientBooking = await this.appointmentRepo.findActiveBookingByPatient(
            appointment.patientId,
            newDate,
            appointment.doctorId,
            slotStart
        );

        if (existingPatientBooking && existingPatientBooking.id !== appointmentId) {
            if (existingPatientBooking.slotStart === slotStart) {
                throw new Error("You already have an active appointment at this time.");
            } else {
                throw new Error("You already have an active appointment with this doctor today.");
            }
        }

        return this.appointmentRepo.rescheduleAppointment(appointmentId, newDate, slotStart, slotEnd);
    }
}
