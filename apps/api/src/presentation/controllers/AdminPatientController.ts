import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "@/shared/constants";
import { GetAllPatientsUseCase } from "@/application/use-cases/patient/getAllPatients.usecase";
import { GetPatientByIdUseCase } from "@/application/use-cases/patient/getPatientById.usecase";
import { ToggleBlockPatientUseCase, DeletePatientUseCase, GetPatientStatsUseCase } from "@/application/use-cases/admin/adminActions.usecase";
import { GetAllAppointmentsUseCase } from "@/application/use-cases/appointment/getAllAppointments.usecase";
import { RescheduleAppointmentUseCase } from "@/application/use-cases/appointment/rescheduleAppointment.usecase";
import { 
    getPatientsQuerySchema, 
    blockPatientSchema 
} from "@/presentation/controllers/dto/validation/patient.dtos";
import { z } from "zod";

export class AdminPatientController {
    constructor(
        private getAllPatientsUseCase: GetAllPatientsUseCase,
        private getPatientByIdUseCase: GetPatientByIdUseCase,
        private toggleBlockPatientUseCase: ToggleBlockPatientUseCase,
        private deletePatientUseCase: DeletePatientUseCase,
        private getPatientStatsUseCase: GetPatientStatsUseCase,
        private getAllAppointmentsUseCase: GetAllAppointmentsUseCase,
        private rescheduleAppointmentUseCase: RescheduleAppointmentUseCase
    ) {}

    getAllPatients = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = getPatientsQuerySchema.parse(req.query);
            const result = await this.getAllPatientsUseCase.execute(query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    blockPatient = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, status } = blockPatientSchema.parse({
                id: req.params.id,
                status: req.body.status
            });
            const result = await this.toggleBlockPatientUseCase.execute(id, status);
            res.json({ message: MESSAGES.PATIENT_STATUS_UPDATED, data: result });
        } catch (error) {
            next(error);
        }
    }

    deletePatient = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = z.string().uuid().parse(req.params.id);
            await this.deletePatientUseCase.execute(id);
            res.json({ message: MESSAGES.PATIENT_DELETED });
        } catch (error) {
            next(error);
        }
    }

    getPatientById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = z.string().uuid().parse(req.params.id);
            const patient = await this.getPatientByIdUseCase.execute(id);
            res.json(patient);
        } catch (error) {
            next(error);
        }
    }

    getPatientStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await this.getPatientStatsUseCase.execute();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    getAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.getAllAppointmentsUseCase.execute();
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    rescheduleAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { newDate, slotStart, slotEnd } = req.body;
            const result = await this.rescheduleAppointmentUseCase.execute({
                appointmentId: id,
                callerId: "",
                callerRole: "admin",
                newDate: new Date(newDate),
                slotStart,
                slotEnd,
            });
            res.json({ message: "Appointment rescheduled successfully", data: result });
        } catch (error: any) {
            next(error);
        }
    }
}
