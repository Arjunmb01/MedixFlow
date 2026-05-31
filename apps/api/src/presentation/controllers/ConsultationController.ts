import { Request, Response, NextFunction } from "express";
import { CheckinPatientUseCase } from "../../application/use-cases/consultation/checkinPatient.usecase";
import { GetDoctorQueueUseCase } from "../../application/use-cases/consultation/getDoctorQueue.usecase";
import { StartConsultationUseCase } from "../../application/use-cases/consultation/startConsultation.usecase";
import { CompleteConsultationUseCase } from "../../application/use-cases/consultation/completeConsultation.usecase";
import { GetPatientHistoryUseCase } from "../../application/use-cases/consultation/getPatientHistory.usecase";
import { GetConsultationDetailsUseCase } from "../../application/use-cases/consultation/getConsultationDetails.usecase";
import { RequestLabTestUseCase } from "../../application/use-cases/consultation/requestLabTest.usecase";
import { UploadLabTestUseCase } from "../../application/use-cases/consultation/uploadLabTest.usecase";
import { ReviewLabTestUseCase } from "../../application/use-cases/consultation/reviewLabTest.usecase";
import { GetLabTestsUseCase } from "../../application/use-cases/consultation/getLabTests.usecase";
import { SaveConsultationDraftUseCase } from "../../application/use-cases/consultation/saveConsultationDraft.usecase";
import { GetConsultationDraftUseCase } from "../../application/use-cases/consultation/getConsultationDraft.usecase";
import { CreateFollowUpConsultationUseCase } from "../../application/use-cases/consultation/createFollowUpConsultation.usecase";
import { ScheduleFollowUpUseCase } from "../../application/use-cases/consultation/scheduleFollowUp.usecase";
import { GenerateConsultationPDFUseCase } from "../../application/use-cases/consultation/generateConsultationPDF.usecase";
import { ConsultationResponseMapper } from "./dto/responses/ConsultationResponse.dto";
import { 
    appointmentIdParamSchema, 
    getQueueQuerySchema, 
    consultationIdSchema,
    completeConsultationSchema,
    getHistoryQuerySchema,
    saveConsultationDraftSchema,
    createFollowUpSchema,
    scheduleFollowUpSchema,
    requestLabTestSchema,
    uploadLabTestSchema,
    reviewLabTestSchema,
    labTestIdParamSchema
} from "./dto/validation/consultation.dtos";
import { z } from "zod";
import { AuthenticatedRequest } from "@/shared/middlewares/auth.middleware";

export class ConsultationController {
    constructor(
        private checkinPatientUseCase: CheckinPatientUseCase,
        private getDoctorQueueUseCase: GetDoctorQueueUseCase,
        private startConsultationUseCase: StartConsultationUseCase,
        private completeConsultationUseCase: CompleteConsultationUseCase,
        private getPatientHistoryUseCase: GetPatientHistoryUseCase,
        private getConsultationDetailsUseCase: GetConsultationDetailsUseCase,
        private requestLabTestUseCase: RequestLabTestUseCase,
        private uploadLabTestUseCase: UploadLabTestUseCase,
        private getLabTestsUseCase: GetLabTestsUseCase,
        private saveDraftUseCase: SaveConsultationDraftUseCase,
        private getDraftUseCase: GetConsultationDraftUseCase,
        private createFollowUpUseCase: CreateFollowUpConsultationUseCase,
        private scheduleFollowUpUseCase: ScheduleFollowUpUseCase,
        private generatePDFUseCase: GenerateConsultationPDFUseCase,
        private reviewLabTestUseCase: ReviewLabTestUseCase
    ) {}

    checkin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const { appointmentId } = appointmentIdParamSchema.parse(req.params);
            const consultation = await this.checkinPatientUseCase.execute(appointmentId, patientId);
            res.json({ success: true, message: "Checked in successfully", data: consultation });
        } catch (error) {
            next(error);
        }
    }

    getQueue = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { date } = getQueueQuerySchema.parse(req.query);
            const queue = await this.getDoctorQueueUseCase.execute(doctorId, date);
            res.json({ success: true, data: queue });
        } catch (error) {
            next(error);
        }
    }

    start = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { id } = consultationIdSchema.parse(req.params);
            const consultation = await this.startConsultationUseCase.execute(id, doctorId);
            res.json({ success: true, message: "Consultation started", data: consultation });
        } catch (error) {
            next(error);
        }
    }

    complete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { id } = consultationIdSchema.parse(req.params);
            const { vitals, medicalRecord, prescription } = completeConsultationSchema.parse(req.body);
            
            const consultation = await this.completeConsultationUseCase.execute(
                id,
                doctorId,
                doctorId, // userId is same as doctorId for doctor role
                vitals,
                medicalRecord,
                prescription
            );

            res.json({ message: "Consultation completed successfully", data: consultation });
        } catch (error) {
            next(error);
        }
    }

<<<<<<< HEAD
=======
    saveDraft = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = consultationIdSchema.parse(req.params);
            const draft = saveConsultationDraftSchema.parse(req.body);
            await this.saveDraftUseCase.execute(id, draft);
            res.json({ message: "Draft saved successfully" });
        } catch (error) {
            next(error);
        }
    }

    getDraft = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = consultationIdSchema.parse(req.params);
            const draft = await this.getDraftUseCase.execute(id);
            res.json(draft);
        } catch (error) {
            next(error);
        }
    }

    createFollowUp = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = consultationIdSchema.parse(req.params);
            const { date, slotStart, slotEnd, reason } = createFollowUpSchema.parse(req.body);
            const followUp = await this.createFollowUpUseCase.execute({
                originalConsultationId: id,
                newDate: date,
                slotStart,
                slotEnd,
                reason
            });
            res.json({ message: "Follow-up consultation created", data: followUp });
        } catch (error) {
            next(error);
        }
    }

    scheduleFollowUp = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const data = scheduleFollowUpSchema.parse(req.body);
            const followUp = await this.scheduleFollowUpUseCase.execute(data);
            res.json({ success: true, message: "Follow-up scheduled", data: followUp });
        } catch (error) {
            next(error);
        }
    }

    generatePDF = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = consultationIdSchema.parse(req.params);
            const userId = req.user.id;
            const role = req.user.role;
            const data = await this.generatePDFUseCase.execute(id, userId, role);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
    getDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { id } = consultationIdSchema.parse(req.params);
            
            const consultation = await this.getConsultationDetailsUseCase.execute({
                id,
                doctorId
            });

            res.json({
                success: true,
                data: ConsultationResponseMapper.toResponse(consultation)
            });
        } catch (error) {
            next(error);
        }
    }

    getPatientHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { patientId } = getHistoryQuerySchema.parse(req.query);
            const history = await this.getPatientHistoryUseCase.execute(patientId, doctorId);
            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            next(error);
        }
    }

    requestLabTest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { id } = consultationIdSchema.parse(req.params);
            const { tests } = requestLabTestSchema.parse(req.body); 
            
            await this.requestLabTestUseCase.execute(id, doctorId, tests as any);
            res.json({ message: "Lab tests requested successfully" });
        } catch (error) {
            next(error);
        }
    }

    uploadLabTest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const { id, labTestId } = labTestIdParamSchema.parse(req.params);
            const { reportUrl } = uploadLabTestSchema.parse(req.body);
            
            await this.uploadLabTestUseCase.execute(id, labTestId, patientId, reportUrl);
            res.json({ message: "Lab test report uploaded successfully" });
        } catch (error) {
            next(error);
        }
    }

    reviewLabTest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { id, labTestId } = labTestIdParamSchema.parse(req.params);
            const { reviewerComments, isAbnormal } = reviewLabTestSchema.parse(req.body);
            
            await this.reviewLabTestUseCase.execute(id, labTestId, doctorId, reviewerComments, isAbnormal);
            res.json({ message: "Lab test reviewed successfully" });
        } catch (error) {
            next(error);
        }
    }

    getLabTests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const { id } = consultationIdSchema.parse(req.params);
            const labTests = await this.getLabTestsUseCase.execute(id, userId, role);
            res.json({
                success: true,
                data: labTests
            });
        } catch (error) {
            next(error);
        }
    }
}
