import { Request, Response, NextFunction } from "express"
import { StatusCode, MESSAGES } from "@/shared/constants";
import { GetAllDoctorsUseCase } from "@/application/usecases/doctor/getAllDoctors.usecase"
import { GetPublicDoctorDetailsUseCase } from "@/application/usecases/doctor/getPublicDoctorDetails.usecase"

export class PublicDoctorController {
    constructor(
        private getAllDoctorsUseCase: GetAllDoctorsUseCase,
        private getDoctorDetailsUseCase: GetPublicDoctorDetailsUseCase
    ) {}

    public getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { specialty, search, availableToday, minFee, maxFee, page = "1", limit = "10" } = req.query
            const skip = (Number(page) - 1) * Number(limit)
            const take = Number(limit)

            const result = await this.getAllDoctorsUseCase.execute({
                specialty: specialty as string,
                search: search as string,
                availableToday: availableToday === "true",
                minFee: minFee ? Number(minFee) : undefined,
                maxFee: maxFee ? Number(maxFee) : undefined,
                skip,
                take
            })
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
