import { Request, Response, NextFunction } from "express";
import { GetConsultedPatientsUseCase } from "@/application/use-cases/doctor/getConsultedPatients.usecase";
import { GetDoctorPrescriptionsUseCase } from "@/application/use-cases/doctor/getDoctorPrescriptions.usecase";
import { UpdatePrescriptionUseCase } from "@/application/use-cases/doctor/updatePrescription.usecase";
import { updatePrescriptionSchema } from "@/presentation/controllers/dto/validation/staff.dtos";
import { z } from "zod";
import { AuthenticatedRequest } from "@/shared/middlewares/auth.middleware";

export class DoctorClinicalController {
    constructor(
        private getConsultedPatientsUseCase: GetConsultedPatientsUseCase,
        private getDoctorPrescriptionsUseCase: GetDoctorPrescriptionsUseCase,
        private updatePrescriptionUseCase: UpdatePrescriptionUseCase
    ) { }

    getConsultedPatients = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const patients = await this.getConsultedPatientsUseCase.execute(userId);
            res.json(patients);
        } catch (error) {
            next(error);
        }
    }

    getDoctorPrescriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const prescriptions = await this.getDoctorPrescriptionsUseCase.execute(userId);
            res.json(prescriptions);
        } catch (error) {
            next(error);
        }
    }

    updatePrescription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = z.string().uuid().parse(req.params.id);
            const data = updatePrescriptionSchema.parse(req.body);
            const updated = await this.updatePrescriptionUseCase.execute({ id, ...data });
            res.json(updated);
        } catch (error) {
            next(error);
        }
    }
}
