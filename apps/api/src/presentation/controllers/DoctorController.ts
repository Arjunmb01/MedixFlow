import { Request, Response, NextFunction } from "express";
import { StatusCode, MESSAGES } from "@/shared/constants";
import { GetDoctorProfileUseCase } from "@/application/usecases/doctor/getDoctorProfile.usecase";
import { UpdateDoctorProfileUseCase } from "@/application/usecases/doctor/updateDoctorProfile.usecase";
import { UpdateDoctorPasswordUseCase } from "@/application/usecases/doctor/updateDoctorPassword.usecase";
import { GetDoctorDashboardStatsUseCase } from "@/application/usecases/doctor/getDoctorDashboardStats.usecase";
import { UpdateDoctorSchedulesUseCase } from "@/application/usecases/doctor/updateDoctorSchedules.usecase";

export class DoctorController {
    constructor(
        private getDoctorProfileUseCase: GetDoctorProfileUseCase,
        private updateDoctorProfileUseCase: UpdateDoctorProfileUseCase,
        private updateDoctorPasswordUseCase: UpdateDoctorPasswordUseCase,
        private getDoctorDashboardStatsUseCase: GetDoctorDashboardStatsUseCase,
        private updateDoctorSchedulesUseCase: UpdateDoctorSchedulesUseCase
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
            const result = await this.updateDoctorPasswordUseCase.execute(userId, req.body);
            res.json(result);
        } catch (error: any) {
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
}
