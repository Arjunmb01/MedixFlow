import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "@/shared/constants";
import { UpdatePatientProfileUseCase } from "@/application/usecases/patient/updatePatientProfile.usecase";
import { UpdateEmergencyContactUseCase } from "@/application/usecases/patient/updateEmergencyContact.usecase";
import { GetPatientProfileUseCase } from "@/application/usecases/patient/getPatientProfile.usecase";
import { UpdatePasswordUseCase } from "@/application/usecases/patient/updatePassword.usecase";
import { GetAllPatientsUseCase } from "@/application/usecases/patient/getAllPatients.usecase";
import { GetPatientByIdUseCase } from "@/application/usecases/patient/getPatientById.usecase";
import { ToggleBlockPatientUseCase, DeletePatientUseCase, GetPatientStatsUseCase } from "@/application/usecases/admin/adminActions.usecase";
import { GetPatientNotificationsUseCase } from "@/application/usecases/patient/getPatientNotifications.usecase";
import { GetUpcomingAppointmentsUseCase } from "@/application/usecases/patient/getUpcomingAppointments.usecase";
import { GetPatientDashboardStatsUseCase } from "@/application/usecases/patient/getPatientDashboardStats.usecase";
import { GetPatientAppointmentsUseCase } from "@/application/usecases/patient/getPatientAppointments.usecase";
import { CancelAppointmentUseCase } from "@/application/usecases/appointment/cancelAppointment.usecase";
import { GetAllAppointmentsUseCase } from "@/application/usecases/appointment/getAllAppointments.usecase";
import { getPatientsQuerySchema, emergencyContactSchema } from "@/presentation/dtos/validation/patient.dtos";

export class PatientController {
    constructor(
        private updatePatientProfileUseCase: UpdatePatientProfileUseCase,
        private updateEmergencyContactUseCase: UpdateEmergencyContactUseCase,
        private getPatientProfileUseCase: GetPatientProfileUseCase,
        private updatePasswordUseCase: UpdatePasswordUseCase,
        private getAllPatientsUseCase: GetAllPatientsUseCase,
        private getPatientByIdUseCase: GetPatientByIdUseCase,
        private toggleBlockPatientUseCase: ToggleBlockPatientUseCase,
        private deletePatientUseCase: DeletePatientUseCase,
        private getPatientStatsUseCase: GetPatientStatsUseCase,
        private getPatientNotificationsUseCase: GetPatientNotificationsUseCase,
        private getUpcomingAppointmentsUseCase: GetUpcomingAppointmentsUseCase,
        private getPatientDashboardStatsUseCase: GetPatientDashboardStatsUseCase,
        private getPatientAppointmentsUseCase: GetPatientAppointmentsUseCase,
        private cancelAppointmentUseCase: CancelAppointmentUseCase,
        private getAllAppointmentsUseCase: GetAllAppointmentsUseCase
    ) {}

    updatePatientProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const result = await this.updatePatientProfileUseCase.execute(patientId, req.body);
            res.json({ message: MESSAGES.PROFILE_UPDATED, data: result });
        } catch (error) {
            next(error);
        }
    }

    updateEmergencyContacts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const { contacts } = emergencyContactSchema.parse(req.body);
            const result = await this.updateEmergencyContactUseCase.execute(patientId, contacts);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    getPatientProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const patient = await this.getPatientProfileUseCase.execute(patientId);
            res.json(patient);
        } catch (error) {
            next(error);
        }
    }

    updatePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const result = await this.updatePasswordUseCase.execute(patientId, req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

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
            const id = req.params.id as string;
            const { status } = req.body;
            const result = await this.toggleBlockPatientUseCase.execute(id, status);
            res.json({ message: MESSAGES.PATIENT_STATUS_UPDATED, data: result });
        } catch (error) {
            next(error);
        }
    }

    deletePatient = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const result = await this.deletePatientUseCase.execute(id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    getPatientById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
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

    getNotifications = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const notifications = await this.getPatientNotificationsUseCase.execute(patientId);
            res.json(notifications);
        } catch (error) {
            next(error);
        }
    }

    getUpcomingAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const appointments = await this.getUpcomingAppointmentsUseCase.execute(patientId);
            res.json(appointments);
        } catch (error) {
            next(error);
        }
    }

    getPatientDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const stats = await this.getPatientDashboardStatsUseCase.execute(patientId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    getPatientAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const appointments = await this.getPatientAppointmentsUseCase.execute(patientId);
            res.json(appointments);
        } catch (error) {
            next(error);
        }
    }

    cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patientId = req.user.id;
            const id = req.params.id as string;
            const { reason } = req.body;
            const result = await this.cancelAppointmentUseCase.execute(id, patientId, reason);
            res.json({ message: MESSAGES.APPOINTMENT_CANCELLED, data: result });
        } catch (error: any) {
            console.error("DEBUG ERROR IN CANCEL APPOINTMENT:", error);
            res.status(500).json({ message: "DEBUG", error: String(error), stack: error?.stack });
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
}
