import { Request, Response, NextFunction } from "express";
import { prisma } from "@/infrastructure/database/prismaClient";
import { StatusCode, MESSAGES } from "@/shared/constants";
import { GetDoctorProfileUseCase } from "@/application/usecases/doctor/getDoctorProfile.usecase";
import { UpdateDoctorProfileUseCase } from "@/application/usecases/doctor/updateDoctorProfile.usecase";
import { UpdateDoctorPasswordUseCase } from "@/application/usecases/doctor/updateDoctorPassword.usecase";
import { GetDoctorDashboardStatsUseCase } from "@/application/usecases/doctor/getDoctorDashboardStats.usecase";
import { UpdateDoctorSchedulesUseCase } from "@/application/usecases/doctor/updateDoctorSchedules.usecase";
import { GetDoctorAppointmentsUseCase } from "@/application/usecases/doctor/getDoctorAppointments.usecase";

export class DoctorController {
    constructor(
        private getDoctorProfileUseCase: GetDoctorProfileUseCase,
        private updateDoctorProfileUseCase: UpdateDoctorProfileUseCase,
        private updateDoctorPasswordUseCase: UpdateDoctorPasswordUseCase,
        private getDoctorDashboardStatsUseCase: GetDoctorDashboardStatsUseCase,
        private updateDoctorSchedulesUseCase: UpdateDoctorSchedulesUseCase,
        private getDoctorAppointmentsUseCase: GetDoctorAppointmentsUseCase
    ) {}

    getDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const profile = await this.getDoctorProfileUseCase.execute(userId);

            if (!profile) {
                return res.status(StatusCode.NOT_FOUND).json({ message: MESSAGES.DOCTOR_PROFILE_NOT_FOUND });
            }

            res.json(profile);
        } catch (error) {
            next(error);
        }
    }

    updateDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const result = await this.updateDoctorProfileUseCase.execute(userId, req.body);
            res.json({ message: MESSAGES.PROFILE_UPDATED, data: result });
        } catch (error) {
            next(error);
        }
    }

    updateDoctorPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            console.log(`Password update requested for doctor user: ${userId}`);
            const result = await this.updateDoctorPasswordUseCase.execute(userId, req.body);
            res.json(result);
        } catch (error: any) {
            console.error("Doctor Password Update Error:", error);
            res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    getDoctorDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const stats = await this.getDoctorDashboardStatsUseCase.execute(userId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    updateDoctorSchedules = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            await this.updateDoctorSchedulesUseCase.execute(userId, req.body);
            res.json({ message: MESSAGES.SCHEDULE_UPDATED });
        } catch (error) {
            next(error);
        }
    }

    getDoctorAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const appointments = await this.getDoctorAppointmentsUseCase.execute(userId);
            res.json(appointments);
        } catch (error) {
            next(error);
        }
    }

    getNotifications = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const notifications = await prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 20
            });
            res.json(notifications);
        } catch (error) {
            next(error);
        }
    }

    getConsultedPatients = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { DoctorRepository } = await import("@/infrastructure/repositories/DoctorRepository");
            const repo = new DoctorRepository();
            const patients = await repo.getConsultedPatients(userId);
            res.json(patients);
        } catch (error) {
            next(error);
        }
    }

    getDoctorPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { DoctorRepository } = await import("@/infrastructure/repositories/DoctorRepository");
            const repo = new DoctorRepository();
            const prescriptions = await repo.getDoctorPrescriptions(userId);
            res.json(prescriptions);
        } catch (error) {
            next(error);
        }
    }

    updatePrescription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const data = req.body;
            const { DoctorRepository } = await import("@/infrastructure/repositories/DoctorRepository");
            const repo = new DoctorRepository();
            const updated = await repo.updatePrescription(id, data);
            res.json(updated);
        } catch (error) {
            next(error);
        }
    }
}
