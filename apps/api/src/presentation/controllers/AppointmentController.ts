import { Request, Response } from "express";
import { GetAvailableSlotCase } from "@/application/use-cases/slot/getAvailableSlots.usecase";
import { BookAppointmentUseCase } from "@/application/use-cases/appointment/bookAppointment.usecase";
import { UpdateAppointmentStatusUseCase } from "@/application/use-cases/appointment/updateAppointmentStatus.usecase";
import { GetAppointmentByIdUseCase } from "@/application/use-cases/appointment/getAppointmentById.usecase";
import { CheckRescheduleConflictUseCase } from "@/application/use-cases/appointment/checkRescheduleConflict.usecase";
import { StatusCode } from "@/shared/constants/statusCodes";
import { MESSAGES } from "@/shared/constants/messages";
import { 
    getAvailableSlotsSchema, 
    bookAppointmentSchema, 
    updateAppointmentStatusSchema 
} from "@/shared/dtos/appointment.dtos";

export class AppointmentController {
    constructor(
        private readonly getSlotsUseCase: GetAvailableSlotCase,
        private readonly bookUseCase: BookAppointmentUseCase,
        private readonly updateStatusUseCase: UpdateAppointmentStatusUseCase,
        private readonly getByIdUseCase: GetAppointmentByIdUseCase,
        private readonly checkConflictUseCase: CheckRescheduleConflictUseCase
    ) { }

    async getSlots(req: Request, res: Response): Promise<void> {
        const { params, query } = getAvailableSlotsSchema.parse({
            params: req.params,
            query: req.query
        });

        const slots = await this.getSlotsUseCase.execute({
            doctorId: params.doctorId,
            date: query.date
        });

        res.status(StatusCode.OK).json({
            success: true,
            data: slots
        });
    }

    async book(req: Request, res: Response): Promise<void> {
        const data = bookAppointmentSchema.parse(req.body);

        const appointment = await this.bookUseCase.execute({
            patientId: data.patientId,
            doctorId: data.doctorId,
            appointmentDate: data.date,
            slotStart: data.slotStart,
            slotEnd: data.slotEnd,
            paymentMethod: data.paymentMethod,
            useWallet: data.useWallet,
            consultationType: data.consultationType,
        });

        res.status(StatusCode.CREATED).json({
            success: true,
            message: MESSAGES.APPOINTMENT_CREATED,
            data: appointment
        });
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        const { params, body } = updateAppointmentStatusSchema.parse({
            params: req.params,
            body: req.body
        });

        const appointment = await this.updateStatusUseCase.execute({
            appointmentId: params.id,
            status: body.status
        });

        res.status(StatusCode.OK).json({
            success: true,
            message: MESSAGES.APPOINTMENT_UPDATED,
            data: appointment
        });
    }

    async getById(req: Request, res: Response): Promise<void> {
        const id = req.params.id as string;
        const appointment = await this.getByIdUseCase.execute(id);

        if (!appointment) {
            res.status(StatusCode.NOT_FOUND).json({
                success: false,
                message: "Appointment not found"
            });
            return;
        }

        res.status(StatusCode.OK).json({
            success: true,
            data: appointment
        });
    }

    async checkConflict(req: Request, res: Response): Promise<void> {
        const { appointmentId, patientId, doctorId, newDate, slotStart, slotEnd } = req.query;

        const result = await this.checkConflictUseCase.execute({
            appointmentId: appointmentId as string,
            patientId: patientId as string,
            doctorId: doctorId as string,
            newDate: new Date(newDate as string),
            slotStart: slotStart as string,
            slotEnd: slotEnd as string,
        });

        res.status(StatusCode.OK).json({
            success: true,
            data: result
        });
    }
}
