import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "@/shared/constants";
import { UpdatePatientProfileUseCase } from "@/application/usecases/patient/updatePatientProfile.usecase";
import { UpdateEmergencyContactUseCase } from "@/application/usecases/patient/updateEmergencyContact.usecase";
import { GetPatientProfileUseCase } from "@/application/usecases/patient/getPatientProfile.usecase";
import { UpdatePasswordUseCase } from "@/application/usecases/patient/updatePassword.usecase";
import { GetAllPatientsUseCase } from "@/application/usecases/patient/getAllPatients.usecase";
import { GetPatientByIdUseCase } from "@/application/usecases/patient/getPatientById.usecase";
import { ToggleBlockPatientUseCase, DeletePatientUseCase, GetPatientStatsUseCase } from "@/application/usecases/admin/adminActions.usecase";
import { getPatientsQuerySchema } from "@/presentation/dtos/validation/patient.dtos";

export class PatientController {
    constructor(
        private updatePatientProfileUseCase: UpdatePatientProfileUseCase,
        private updateEmergencyContactUseCase: UpdateEmergencyContactUseCase,
        private getPatientProfileUseCase: GetPatientProfileUseCase,
        private updatePasswordUseCase: UpdatePasswordUseCase,
        private getAllPatientsUseCase: GetAllPatientsUseCase,
        private getPatientByIdUseCase: GetPatientByIdUseCase,
        private toggleBlockPatientUseCase: ToggleBlockPatientUseCase,
        private deletePatientUseCase: DeletePatientUseCase,
        private getPatientStatsUseCase: GetPatientStatsUseCase
    ) {}

    updatePatientProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const result = await this.updatePatientProfileUseCase.execute(patientId, req.body);
            res.json({ message: MESSAGES.PROFILE_UPDATED, data: result });
        } catch (error) {
            next(error);
        }
    }

    updateEmergencyContacts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const result = await this.updateEmergencyContactUseCase.execute(patientId, req.body.contacts);
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
            const result = await this.updatePasswordUseCase.execute(patientId, req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    getAllPatients = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = getPatientsQuerySchema.parse(req.query);
            const result = await this.getAllPatientsUseCase.execute(query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    blockPatient = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { status } = req.body;
            const result = await this.toggleBlockPatientUseCase.execute(id, status);
            res.json({ message: MESSAGES.PATIENT_STATUS_UPDATED, data: result });
        } catch (error) {
            next(error);
        }
    }

    deletePatient = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const result = await this.deletePatientUseCase.execute(id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    getPatientById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const patient = await this.getPatientByIdUseCase.execute(id);
            res.json(patient);
        } catch (error) {
            next(error);
        }
    }

    getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await this.getPatientStatsUseCase.execute();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
}
