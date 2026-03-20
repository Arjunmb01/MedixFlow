import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "@/shared/constants";
import { GetDoctorsUseCase, CreateDoctorUseCase, UpdateStaffDoctorUseCase, BlockDoctorUseCase, DeleteDoctorUseCase, SetupPasswordUseCase } from "@/application/usecases/staff/staffActions.usecase";
import { createDoctorSchema, getDoctorsQuerySchema } from "@/presentation/dtos/validation/staff.dtos";

export class StaffController {
    constructor(
        private getDoctorsUseCase: GetDoctorsUseCase,
        private createDoctorUseCase: CreateDoctorUseCase,
        private updateStaffDoctorUseCase: UpdateStaffDoctorUseCase,
        private blockDoctorUseCase: BlockDoctorUseCase,
        private deleteDoctorUseCase: DeleteDoctorUseCase,
        private setupPasswordUseCase: SetupPasswordUseCase
    ) {}

    getDoctors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = getDoctorsQuerySchema.parse(req.query);
            const result = await this.getDoctorsUseCase.execute(query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    createDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = createDoctorSchema.parse(req.body);
            const host = req.get('host') || 'localhost:5000';
            const protocol = req.protocol;
            
            const result = await this.createDoctorUseCase.execute(payload, host, protocol);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const result = await this.updateStaffDoctorUseCase.execute(id, req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    blockDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { status } = req.body;
            const result = await this.blockDoctorUseCase.execute(id, status);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    deleteDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const result = await this.deleteDoctorUseCase.execute(id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    setupPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, password } = req.body;
            const result = await this.setupPasswordUseCase.execute(token, password);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
