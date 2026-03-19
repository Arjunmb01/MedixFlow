import { Request, Response, NextFunction } from "express"
import { StatusCode, MESSAGES } from "../../../core/constants";
import { DoctorRepository } from "../repositories/doctor.repository"
import { GetAllDoctorsUseCase } from "../usecases/getAllDoctors.usecase"
import { GetPublicDoctorDetailsUseCase } from "../usecases/getPublicDoctorDetails.usecase"

const repo = new DoctorRepository()

export const getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { specialty, search, availableToday, minFee, maxFee, page = "1", limit = "10" } = req.query
        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const usecase = new GetAllDoctorsUseCase(repo)
        const result = await usecase.execute({
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

export const getDoctorDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string
        const usecase = new GetPublicDoctorDetailsUseCase(repo)
        const doctor = await usecase.execute(id)
        if (!doctor) {
            return res.status(StatusCode.NOT_FOUND).json({ message: MESSAGES.DOCTOR_NOT_FOUND })
        }
        res.json(doctor)
    } catch (error) {
        next(error)
    }
}
