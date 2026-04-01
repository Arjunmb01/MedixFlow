import { Request, Response, NextFunction } from "express";
import { CheckinPatientUseCase } from "../../application/use-cases/consultation/checkinPatient.usecase";
import { GetDoctorQueueUseCase } from "../../application/use-cases/consultation/getDoctorQueue.usecase";
import { StartConsultationUseCase } from "../../application/use-cases/consultation/startConsultation.usecase";
import { CompleteConsultationUseCase } from "../../application/use-cases/consultation/completeConsultation.usecase";
import { GetPatientHistoryUseCase } from "../../application/use-cases/consultation/getPatientHistory.usecase";
import { IConsultationRepository } from "../../domain/repositories/IConsultationRepository";

export class ConsultationController {
    constructor(
        private checkinPatientUseCase: CheckinPatientUseCase,
        private getDoctorQueueUseCase: GetDoctorQueueUseCase,
        private startConsultationUseCase: StartConsultationUseCase,
        private completeConsultationUseCase: CompleteConsultationUseCase,
        private getPatientHistoryUseCase: GetPatientHistoryUseCase,
        private consultationRepo: IConsultationRepository
    ) {}

    checkin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const appointmentId = req.params.appointmentId as string;
            const consultation = await this.checkinPatientUseCase.execute(appointmentId, patientId);
            res.json({ message: "Checked in successfully", data: consultation });
        } catch (error) {
            next(error);
        }
    }

    getQueue = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const dateStr = req.query.date as string;
            const date = dateStr ? new Date(dateStr) : new Date();
            const queue = await this.getDoctorQueueUseCase.execute(doctorId, date);
            res.json(queue);
        } catch (error) {
            next(error);
        }
    }

    start = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const id = req.params.id as string;
            const consultation = await this.startConsultationUseCase.execute(id, doctorId);
            res.json({ message: "Consultation started", data: consultation });
        } catch (error) {
            next(error);
        }
    }

    complete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const id = req.params.id as string;
            const { vitals, medicalRecord, prescription } = req.body;
            
            const consultation = await this.completeConsultationUseCase.execute(
                id,
                doctorId,
                vitals,
                medicalRecord,
                prescription
            );

            res.json({ message: "Consultation completed successfully", data: consultation });
        } catch (error) {
            next(error);
        }
    }

    getDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const id = req.params.id as string;
            const consultation = await this.consultationRepo.findById(id);
            if (!consultation) {
                return res.status(404).json({ message: "Consultation not found" });
            }
            if (consultation.doctorId !== doctorId) {
                return res.status(403).json({ message: "Unauthorized" });
            }
            res.json(consultation);
        } catch (error) {
            next(error);
        }
    }

    getPatientHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.query.patientId as string;
            if (!patientId) {
                return res.status(400).json({ message: "patientId query parameter is required" });
            }
            const history = await this.getPatientHistoryUseCase.execute(patientId);
            res.json(history);
        } catch (error) {
            next(error);
        }
    }
}
