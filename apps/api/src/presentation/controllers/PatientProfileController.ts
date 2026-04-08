import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "@/shared/constants";
import { UpdatePatientProfileUseCase } from "@/application/use-cases/patient/updatePatientProfile.usecase";
import { UpdateEmergencyContactUseCase } from "@/application/use-cases/patient/updateEmergencyContact.usecase";
import { GetPatientProfileUseCase } from "@/application/use-cases/patient/getPatientProfile.usecase";
import { UpdatePasswordUseCase } from "@/application/use-cases/patient/updatePassword.usecase";
import { 
    emergencyContactSchema,
    updatePatientProfileSchema 
} from "@/presentation/controllers/dto/validation/patient.dtos";
import { updatePasswordSchema } from "@/presentation/controllers/dto/validation/auth.dtos";

export class PatientProfileController {
    constructor(
        private updatePatientProfileUseCase: UpdatePatientProfileUseCase,
        private updateEmergencyContactUseCase: UpdateEmergencyContactUseCase,
        private getPatientProfileUseCase: GetPatientProfileUseCase,
        private updatePasswordUseCase: UpdatePasswordUseCase
    ) {}

    updatePatientProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const data = updatePatientProfileSchema.parse(req.body);
            const result = await this.updatePatientProfileUseCase.execute(patientId, data);
            res.json({ message: MESSAGES.PROFILE_UPDATED, data: result });
        } catch (error) {
            next(error);
        }
    }

    updateEmergencyContacts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const { contacts } = emergencyContactSchema.parse(req.body);
            const result = await this.updateEmergencyContactUseCase.execute(patientId, contacts);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    getPatientProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const patient = await this.getPatientProfileUseCase.execute(patientId);
            res.json(patient);
        } catch (error) {
            next(error);
        }
    }

    updatePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);
            const result = await this.updatePasswordUseCase.execute(patientId, { currentPassword, newPassword });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
