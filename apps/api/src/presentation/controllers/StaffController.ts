import { Request, Response, NextFunction } from "express";
import { StatusCode, MESSAGES } from "@/shared/constants";
import { GetDoctorsUseCase } from "@/application/use-cases/staff/GetDoctorsUseCase";
import { CreateDoctorUseCase } from "@/application/use-cases/staff/CreateDoctorUseCase";
import { UpdateStaffDoctorUseCase } from "@/application/use-cases/staff/UpdateStaffDoctorUseCase";
import { BlockDoctorUseCase } from "@/application/use-cases/staff/BlockDoctorUseCase";
import { DeleteDoctorUseCase } from "@/application/use-cases/staff/DeleteDoctorUseCase";
import { SetupPasswordUseCase } from "@/application/use-cases/staff/SetupPasswordUseCase";
import { createDoctorSchema, getDoctorsQuerySchema, updateDoctorSchema } from "@/presentation/controllers/dto/validation/staff.dtos";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";

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
            const result = await this.getDoctorsUseCase.execute(query as any); // Cast for Zod output compatibility
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
            
            const result = await this.createDoctorUseCase.execute(payload);
            res.status(StatusCode.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    }

    updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const data = updateDoctorSchema.parse(req.body);
            const result = await this.updateStaffDoctorUseCase.execute({ id, data });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    blockDoctor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { status } = req.body;
            const result = await this.blockDoctorUseCase.execute({ id, status: status as UserStatus });
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
            const result = await this.setupPasswordUseCase.execute({ token, password });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}



