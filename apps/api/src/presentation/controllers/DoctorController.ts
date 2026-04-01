import { Request, Response, NextFunction } from "express";
import { StatusCode, MESSAGES } from "@/shared/constants";
import { GetDoctorProfileUseCase } from "@/application/use-cases/doctor/getDoctorProfile.usecase";
import { UpdateDoctorProfileUseCase } from "@/application/use-cases/doctor/updateDoctorProfile.usecase";
import { UpdateDoctorPasswordUseCase } from "@/application/use-cases/doctor/updateDoctorPassword.usecase";
import { GetDoctorDashboardStatsUseCase } from "@/application/use-cases/doctor/getDoctorDashboardStats.usecase";
import { UpdateDoctorSchedulesUseCase } from "@/application/use-cases/doctor/updateDoctorSchedules.usecase";
import { GetDoctorAppointmentsUseCase } from "@/application/use-cases/doctor/getDoctorAppointments.usecase";
import { GenerateSlotsUseCase } from "@/application/use-cases/slot/generateSlots.usecase";
import { GetConsultedPatientsUseCase } from "@/application/use-cases/doctor/getConsultedPatients.usecase";
import { GetDoctorPrescriptionsUseCase } from "@/application/use-cases/doctor/getDoctorPrescriptions.usecase";
import { UpdatePrescriptionUseCase } from "@/application/use-cases/doctor/updatePrescription.usecase";

export class DoctorController {
    constructor(
        private getDoctorProfileUseCase: GetDoctorProfileUseCase,
        private updateDoctorProfileUseCase: UpdateDoctorProfileUseCase,
        private updateDoctorPasswordUseCase: UpdateDoctorPasswordUseCase,
        private getDoctorDashboardStatsUseCase: GetDoctorDashboardStatsUseCase,
        private updateDoctorSchedulesUseCase: UpdateDoctorSchedulesUseCase,
        private getDoctorAppointmentsUseCase: GetDoctorAppointmentsUseCase,
        private generateSlotsUseCase: GenerateSlotsUseCase,
        private getConsultedPatientsUseCase: GetConsultedPatientsUseCase,
        private getDoctorPrescriptionsUseCase: GetDoctorPrescriptionsUseCase,
        private updatePrescriptionUseCase: UpdatePrescriptionUseCase
    ) {}

    getDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const profile = await this.getDoctorProfileUseCase.execute(userId);

            if (!profile) {
                return res.status(StatusCode.NOT_FOUND).json({ message: MESSAGES.DOCTOR_PROFILE_NOT_FOUND });
            }

            res.json(profile);
        } catch (error) {
            next(error);
        }
    }

    updateDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const result = await this.updateDoctorProfileUseCase.execute(userId, req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    updateDoctorPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            console.log(`Password update requested for doctor user: ${userId}`);
            const result = await this.updateDoctorPasswordUseCase.execute(userId, req.body);
            res.json(result);
        } catch (error: any) {
            console.error("Doctor Password Update Error:", error);
            res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }

    getDoctorDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const stats = await this.getDoctorDashboardStatsUseCase.execute(userId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    updateDoctorSchedules = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            await this.updateDoctorSchedulesUseCase.execute(userId, req.body);
            res.json({ message: MESSAGES.SCHEDULE_UPDATED });
        } catch (error) {
            next(error);
        }
    }

    generateSlots = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { date } = req.body;
            if (!date) {
                return res.status(StatusCode.BAD_REQUEST).json({ message: "Date is required" });
            }
            await this.generateSlotsUseCase.execute({ doctorId, date: new Date(date) });
            res.json({ message: "Slots generated successfully" });
        } catch (error) {
            next(error);
        }
    }

    getDoctorAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const appointments = await this.getDoctorAppointmentsUseCase.execute(userId);
            res.json(appointments);
        } catch (error) {
            next(error);
        }
    }

    getConsultedPatients = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const patients = await this.getConsultedPatientsUseCase.execute(userId);
            res.json(patients);
        } catch (error) {
            next(error);
        }
    }

    getDoctorPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
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
            const id = req.params.id as string;
            const data = req.body;
            const updated = await this.updatePrescriptionUseCase.execute({ id, ...data });
            res.json(updated);
        } catch (error) {
            next(error);
        }
    }
}

