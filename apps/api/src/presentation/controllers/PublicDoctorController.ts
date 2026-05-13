import { Request, Response, NextFunction } from "express"
import { StatusCode, MESSAGES } from "@/shared/constants";
import { GetAllDoctorsUseCase } from "@/application/use-cases/doctor/getAllDoctors.usecase"
import { GetPublicDoctorDetailsUseCase } from "@/application/use-cases/doctor/getPublicDoctorDetails.usecase"

import { getPublicDoctorsQuerySchema } from "@/presentation/controllers/dto/validation/public-doctor.dtos";

export class PublicDoctorController {
    constructor(
        private getAllDoctorsUseCase: GetAllDoctorsUseCase,
        private getDoctorDetailsUseCase: GetPublicDoctorDetailsUseCase
    ) {}

    public getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = getPublicDoctorsQuerySchema.parse(req.query);
            const result = await this.getAllDoctorsUseCase.execute(query);
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    public getDoctorDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string
            const doctor = await this.getDoctorDetailsUseCase.execute(id)
            if (!doctor) {
                return res.status(StatusCode.NOT_FOUND).json({ message: MESSAGES.DOCTOR_NOT_FOUND })
            }
            res.json(doctor)
        } catch (error) {
            next(error)
        }
    }
}

