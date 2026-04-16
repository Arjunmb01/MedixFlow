import { Request, Response, NextFunction } from "express";
import { StatusCode, MESSAGES } from "@/shared/constants";
import { GetDoctorDashboardStatsUseCase } from "@/application/use-cases/doctor/getDoctorDashboardStats.usecase";
import { GetDoctorAppointmentsUseCase } from "@/application/use-cases/doctor/getDoctorAppointments.usecase";
import { UpdateDoctorSchedulesUseCase } from "@/application/use-cases/doctor/updateDoctorSchedules.usecase";
import { GenerateSlotsUseCase } from "@/application/use-cases/slot/generateSlots.usecase";
import { DoctorAppointmentFilter } from "@/domain/value-objects/types/appointment.types";
import { RescheduleAppointmentUseCase } from "@/application/use-cases/appointment/rescheduleAppointment.usecase";
import { 
    getDoctorAppointmentsQuerySchema, 
    generateSlotsSchema
} from "@/presentation/controllers/dto/validation/staff.dtos";

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: string;
    };
}

export class DoctorAppointmentController {
    constructor(
        private getDoctorDashboardStatsUseCase: GetDoctorDashboardStatsUseCase,
        private getDoctorAppointmentsUseCase: GetDoctorAppointmentsUseCase,
        private updateDoctorSchedulesUseCase: UpdateDoctorSchedulesUseCase,
        private generateSlotsUseCase: GenerateSlotsUseCase,
        private rescheduleAppointmentUseCase: RescheduleAppointmentUseCase
    ) { }

    getDoctorDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const stats = await this.getDoctorDashboardStatsUseCase.execute(userId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    getDoctorAppointments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const validatedQuery = getDoctorAppointmentsQuerySchema.parse(req.query);

            const filter: DoctorAppointmentFilter = {
                status: validatedQuery.status,
                fromDate: validatedQuery.fromDate,
                toDate: validatedQuery.toDate,
                isUpcoming: validatedQuery.type === "upcoming" ? true : validatedQuery.type === "past" ? false : undefined,
                page: validatedQuery.page,
                limit: validatedQuery.limit,
            };

            const appointments = await this.getDoctorAppointmentsUseCase.execute(userId, filter);
            res.status(StatusCode.OK).json(appointments);
        } catch (error) {
            next(error);
        }
    }

    updateDoctorSchedules = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            await this.updateDoctorSchedulesUseCase.execute(userId, req.body);
            res.json({ message: MESSAGES.SCHEDULE_UPDATED });
        } catch (error) {
            next(error);
        }
    }

    generateSlots = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user.id;
            const { date } = generateSlotsSchema.parse(req.body);
            await this.generateSlotsUseCase.execute({ doctorId, date });
            res.json({ message: "Slots generated successfully" });
        } catch (error) {
            next(error);
        }
    }

    rescheduleAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const callerId = req.user.id;
            const id = req.params.id as string;
            const { newDate, slotStart, slotEnd } = req.body;
            const result = await this.rescheduleAppointmentUseCase.execute({
                appointmentId: id,
                callerId,
                callerRole: "doctor",
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
