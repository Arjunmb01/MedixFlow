import { Request, Response, NextFunction } from "express"
import { StatusCode, MESSAGES } from "../../../core/constants";
import { DoctorRepository } from "../repositories/doctor.repository"
import { GetDoctorProfileUseCase } from "../usecases/getDoctorProfile.usecase"
import { UpdateDoctorProfileUseCase } from "../usecases/updateDoctorProfile.usecase"
import { UpdateDoctorPasswordUseCase } from "../usecases/updateDoctorPassword.usecase"
import { GetDoctorDashboardStatsUseCase } from "../usecases/getDoctorDashboardStats.usecase"
import { UpdateDoctorSchedulesUseCase } from "../usecases/updateDoctorSchedules.usecase"

const repo = new DoctorRepository()

export const getDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id
        const usecase = new GetDoctorProfileUseCase(repo)
        const profile = await usecase.execute(userId)

        if (!profile) {
            return res.status(StatusCode.NOT_FOUND).json({ message: MESSAGES.DOCTOR_PROFILE_NOT_FOUND })
        }

        res.json(profile)
    } catch (error) {
        next(error)
    }
}

export const updateDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id
        const usecase = new UpdateDoctorProfileUseCase(repo)
        const result = await usecase.execute(userId, req.body)

        res.json({
            message: MESSAGES.PROFILE_UPDATED,
            data: result
        })
    } catch (error) {
        next(error)
    }
}

export const updateDoctorPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id
        const usecase = new UpdateDoctorPasswordUseCase(repo)
        const result = await usecase.execute(userId, req.body)

        res.json(result)
    } catch (error: any) {
        res.status(StatusCode.BAD_REQUEST).json({ message: error.message })
    }
}

export const getDoctorDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id
        const usecase = new GetDoctorDashboardStatsUseCase(repo)
        const stats = await usecase.execute(userId)
        res.json(stats)
    } catch (error) {
        next(error)
    }
}

export const updateDoctorSchedules = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id
        const usecase = new UpdateDoctorSchedulesUseCase(repo)
        await usecase.execute(userId, req.body)
        res.json({ message: MESSAGES.SCHEDULE_UPDATED })
    } catch (error) {
        next(error)
    }
}
