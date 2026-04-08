import { Request, Response, NextFunction } from "express";
import { StatusCode, MESSAGES } from "@/shared/constants";
import { GetDoctorProfileUseCase } from "@/application/use-cases/doctor/getDoctorProfile.usecase";
import { UpdateDoctorProfileUseCase } from "@/application/use-cases/doctor/updateDoctorProfile.usecase";
import { UpdateDoctorPasswordUseCase } from "@/application/use-cases/doctor/updateDoctorPassword.usecase";
import { updateDoctorSchema } from "@/presentation/controllers/dto/validation/staff.dtos";
import { updatePasswordSchema } from "@/presentation/controllers/dto/validation/auth.dtos";

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: string;
    };
}

export class DoctorProfileController {
    constructor(
        private getDoctorProfileUseCase: GetDoctorProfileUseCase,
        private updateDoctorProfileUseCase: UpdateDoctorProfileUseCase,
        private updateDoctorPasswordUseCase: UpdateDoctorPasswordUseCase
    ) { }

    getDoctorProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    updateDoctorProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const data = updateDoctorSchema.parse(req.body);
            const result = await this.updateDoctorProfileUseCase.execute(userId, data);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    updateDoctorPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);
            const result = await this.updateDoctorPasswordUseCase.execute(userId, { currentPassword, newPassword });
            res.json(result);
        } catch (error: unknown) {
            next(error);
        }
    }
}
