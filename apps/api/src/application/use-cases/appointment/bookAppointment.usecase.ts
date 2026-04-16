import {IAppointmentRepository,AppointmentRecord} from "../../../domain/repositories/IAppointmentRepository";
import { CreateAppointmentInput } from "../../../domain/value-objects/types/appointment.types";
import { SchedulingPolicy } from "../../../domain/services/SchedulingPolicy";
import { IDateTimeService } from "../../../domain/services/IDateTimeService";

export class BookAppointmentUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly schedulingPolicy: SchedulingPolicy,
        private readonly dateTimeService: IDateTimeService
    ) { }

    async execute(data: CreateAppointmentInput): Promise<AppointmentRecord> {
        if (!data.patientId || !data.doctorId) {
            throw new Error("Invalid patient or doctor");
        }

        if (!data.appointmentDate) {
            throw new Error("Invalid date");
        }

        if (!data.slotStart || !data.slotEnd) {
            throw new Error("Invalid slot");
        }

        const now = this.dateTimeService.now();
        const year = data.appointmentDate.getUTCFullYear();
        const month = data.appointmentDate.getUTCMonth();
        const day = data.appointmentDate.getUTCDate();
        const [hours, minutes] = data.slotStart.split(":").map(Number);

        const appointmentTime = new Date(year, month, day, hours, minutes, 0, 0);

        if (appointmentTime < now) {
            throw new Error("Cannot book an appointment in the past");
        }

        const schedule = await this.appointmentRepo.getDoctorSchedule(data.doctorId, data.appointmentDate.getDay());
        const capacity = schedule?.slotCapacity ?? (schedule ? this.schedulingPolicy.calculateSlotCapacity(schedule.slotDurationMinutes) : 5);

        const activeBookings = await this.appointmentRepo.countActiveBookings(data.doctorId, data.appointmentDate, data.slotStart);

        if (activeBookings >= capacity) {
            throw new Error(`Slot is full (capacity: ${capacity} patients)`);
        }

        const existingPatientBooking = await this.appointmentRepo.findActiveBookingByPatient(
            data.patientId,
            data.appointmentDate,
            data.doctorId,
            data.slotStart
        );

        if (existingPatientBooking) {
            if (existingPatientBooking.slotStart === data.slotStart) {
                throw new Error("You already have an active appointment at this time.");
            } else {
                throw new Error("You already have an active appointment with this doctor today.");
            }
        }

        const appointment = await this.appointmentRepo.createWithTransaction(data);

        return appointment;
    }
}