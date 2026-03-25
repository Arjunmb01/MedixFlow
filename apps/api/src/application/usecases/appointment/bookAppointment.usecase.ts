import { title } from "node:process";
import {
    IAppointmentRepository,
    CreateAppointmentDTO,
} from "../../../domain/repositories/IAppointmentRepository";
import { Appointment } from "@prisma/client";

export class BookAppointmentUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly notificationRepo: any
    ) { }

    async execute(data: CreateAppointmentDTO): Promise<Appointment> {
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

        const appointment = await this.appointmentRepo.createWithTransaction(data)

        await this.notificationRepo.createMany([
            {
                userId: data.patientId,
                title: "Appointment Confirmed",
                message: `Your Appointment is scheduled on ${data.appointmentDate.toDateString()} at ${data.slotStart}`,
                type: "APPOINTMENT"
            },
            {
                userId: data.doctorId,
                title: "New Appointment",
                message: `New appointment booked at ${data.slotStart}`,
                type: "APPOINTMENT",
            },
        ])

        return appointment;
    }
}