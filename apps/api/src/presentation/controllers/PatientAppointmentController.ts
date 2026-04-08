import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "@/shared/constants";
import { GetUpcomingAppointmentsUseCase } from "@/application/use-cases/patient/getUpcomingAppointments.usecase";
import { GetPatientDashboardStatsUseCase } from "@/application/use-cases/patient/getPatientDashboardStats.usecase";
import { GetPatientAppointmentsUseCase } from "@/application/use-cases/patient/getPatientAppointments.usecase";
import { CancelAppointmentUseCase } from "@/application/use-cases/appointment/cancelAppointment.usecase";

export class PatientAppointmentController {
    constructor(
        private getUpcomingAppointmentsUseCase: GetUpcomingAppointmentsUseCase,
        private getPatientDashboardStatsUseCase: GetPatientDashboardStatsUseCase,
        private getPatientAppointmentsUseCase: GetPatientAppointmentsUseCase,
        private cancelAppointmentUseCase: CancelAppointmentUseCase
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
            const { reason } = req.body;
            const result = await this.cancelAppointmentUseCase.execute(id, patientId, reason);
            res.json({ message: MESSAGES.APPOINTMENT_CANCELLED, data: result });
        } catch (error: any) {
            next(error);
        }
    }
}
