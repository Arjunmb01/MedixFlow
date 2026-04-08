import { Request, Response, NextFunction } from "express";
import { CheckinPatientUseCase } from "../../application/use-cases/consultation/checkinPatient.usecase";
import { GetDoctorQueueUseCase } from "../../application/use-cases/consultation/getDoctorQueue.usecase";
import { StartConsultationUseCase } from "../../application/use-cases/consultation/startConsultation.usecase";
import { CompleteConsultationUseCase } from "../../application/use-cases/consultation/completeConsultation.usecase";
import { GetPatientHistoryUseCase } from "../../application/use-cases/consultation/getPatientHistory.usecase";
import { GetConsultationDetailsUseCase } from "../../application/use-cases/consultation/getConsultationDetails.usecase";
import { ConsultationResponseMapper } from "./dto/responses/ConsultationResponse.dto";
import { 
    appointmentIdParamSchema, 
    getQueueQuerySchema, 
    consultationIdSchema, 
    completeConsultationSchema,
    getHistoryQuerySchema 
} from "./dto/validation/consultation.dtos";
import { z } from "zod";

export class ConsultationController {
    constructor(
        private checkinPatientUseCase: CheckinPatientUseCase,
        private getDoctorQueueUseCase: GetDoctorQueueUseCase,
        private startConsultationUseCase: StartConsultationUseCase,
        private completeConsultationUseCase: CompleteConsultationUseCase,
        private getPatientHistoryUseCase: GetPatientHistoryUseCase,
        private getConsultationDetailsUseCase: GetConsultationDetailsUseCase
    ) {}

    checkin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const { appointmentId } = appointmentIdParamSchema.parse(req.params);
            const consultation = await this.checkinPatientUseCase.execute(appointmentId, patientId);
            res.json({ message: "Checked in successfully", data: consultation });
        } catch (error) {
            next(error);
        }
    }

    getQueue = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { date } = getQueueQuerySchema.parse(req.query);
            const queue = await this.getDoctorQueueUseCase.execute(doctorId, date);
            res.json(queue);
        } catch (error) {
            next(error);
        }
    }

    start = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { id } = consultationIdSchema.parse(req.params);
            const consultation = await this.startConsultationUseCase.execute(id, doctorId);
            res.json({ message: "Consultation started", data: consultation });
        } catch (error) {
            next(error);
        }
    }

    complete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { id } = consultationIdSchema.parse(req.params);
            const { vitals, medicalRecord, prescription } = completeConsultationSchema.parse(req.body);
            
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
            const { id } = consultationIdSchema.parse(req.params);
            
            const consultation = await this.getConsultationDetailsUseCase.execute({
                id,
                doctorId
            });

            res.json(ConsultationResponseMapper.toResponse(consultation));
        } catch (error) {
            next(error);
        }
    }

    getPatientHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { patientId } = getHistoryQuerySchema.parse(req.query);
            const history = await this.getPatientHistoryUseCase.execute(patientId);
            res.json(history);
        } catch (error) {
            next(error);
        }
    }
}
