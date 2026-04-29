import { Request, Response, NextFunction } from "express"
import { StatusCode, MESSAGES } from "@/shared/constants";
import { GetAllDoctorsUseCase } from "@/application/use-cases/doctor/getAllDoctors.usecase"
import { GetPublicDoctorDetailsUseCase } from "@/application/use-cases/doctor/getPublicDoctorDetails.usecase"

export class PublicDoctorController {
    constructor(
        private getAllDoctorsUseCase: GetAllDoctorsUseCase,
        private getDoctorDetailsUseCase: GetPublicDoctorDetailsUseCase
    ) {}

    public getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { specialty, search, availableToday, minFee, maxFee, experienceYears, minRating, language, sortBy, page = "1", limit = "10" } = req.query;

            const result = await this.getAllDoctorsUseCase.execute({
                specialty: specialty as string,
                search: search as string,
                availableToday: availableToday === "true",
                minFee: minFee ? Number(minFee) : undefined,
                maxFee: maxFee ? Number(maxFee) : undefined,
                experienceYears: experienceYears ? Number(experienceYears) : undefined,
                minRating: minRating ? Number(minRating) : undefined,
                language: language as string,
                sortBy: sortBy as any,
                page: Number(page),
                limit: Number(limit)
            });
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

