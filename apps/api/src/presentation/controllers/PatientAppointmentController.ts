import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "@/shared/constants";
import { GetUpcomingAppointmentsUseCase } from "@/application/use-cases/patient/getUpcomingAppointments.usecase";
import { GetPatientDashboardStatsUseCase } from "@/application/use-cases/patient/getPatientDashboardStats.usecase";
import { GetPatientAppointmentsUseCase } from "@/application/use-cases/patient/getPatientAppointments.usecase";
import { CancelAppointmentUseCase } from "@/application/use-cases/appointment/cancelAppointment.usecase";
import { RescheduleAppointmentUseCase } from "@/application/use-cases/appointment/rescheduleAppointment.usecase";

export class PatientAppointmentController {
    constructor(
        private getUpcomingAppointmentsUseCase: GetUpcomingAppointmentsUseCase,
        private getPatientDashboardStatsUseCase: GetPatientDashboardStatsUseCase,
        private getPatientAppointmentsUseCase: GetPatientAppointmentsUseCase,
        private cancelAppointmentUseCase: CancelAppointmentUseCase,
        private rescheduleAppointmentUseCase: RescheduleAppointmentUseCase
    ) {}

    getUpcomingAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const appointments = await this.getUpcomingAppointmentsUseCase.execute(patientId);
            res.json(appointments);
        } catch (error) {
            next(error);
        }
    }

    getPatientDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const stats = await this.getPatientDashboardStatsUseCase.execute(patientId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    getPatientAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const appointments = await this.getPatientAppointmentsUseCase.execute(patientId);
            res.json(appointments);
        } catch (error) {
            next(error);
        }
    }

    cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const id = req.params.id as string;
            const { reason, refundToWallet } = req.body;
            const result = await this.cancelAppointmentUseCase.execute(id, patientId, reason, refundToWallet === true || refundToWallet === "true");
            res.json({ message: MESSAGES.APPOINTMENT_CANCELLED, data: result });
        } catch (error: any) {
            next(error);
        }
    }

    rescheduleAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const callerId = req.user.id;
            const id = req.params.id as string;
            const { newDate, slotStart, slotEnd } = req.body;
            const result = await this.rescheduleAppointmentUseCase.execute({
                appointmentId: id,
                callerId,
                callerRole: "patient",
                newDate: new Date(newDate),
                slotStart,
                slotEnd,
            });
            res.json({ message: "Appointment rescheduled successfully", data: result });
        } catch (error: any) {
            next(error);
        }
    }
}
