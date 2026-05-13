import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/shared/middlewares/auth.middleware";
import { BookSlotUseCase } from "@/application/use-cases/slot/bookSlot.usecase";
import { GenerateSlotsUseCase } from "@/application/use-cases/slot/generateSlots.usecase";
import { GetAvailableSlotCase } from "@/application/use-cases/slot/getAvailableSlots.usecase";
import { StatusCode } from "@/shared/constants";

export class SlotController { 
    constructor(
        private readonly generateSlotUseCase: GenerateSlotsUseCase,
        private readonly getAvailableSlotsUseCase: GetAvailableSlotCase,
        private readonly bookSlotUseCase: BookSlotUseCase
    ) {}

    generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { doctorId, date } = req.query;
            if (!doctorId || !date) {
                res.status(StatusCode.BAD_REQUEST).json({ message: "Doctor ID and date are required" });
                return;
            }
            await this.generateSlotUseCase.execute({ doctorId: doctorId as string, date: new Date(date as string) });
            res.status(StatusCode.OK).json({ message: "Slots generated successfully" });
        } catch (error) {
            next(error);
        }
    }

    getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { doctorId, date } = req.query;
            if (!doctorId || !date) {
                res.status(StatusCode.BAD_REQUEST).json({ message: "Doctor ID and date are required" });
                return;
            }
            const slots = await this.getAvailableSlotsUseCase.execute({ doctorId: doctorId as string, date: new Date(date as string) });
            res.status(StatusCode.OK).json(slots);
        } catch (error) {
            next(error);
        }
    }

    bookSlot = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { doctorId, startTime, endTime, reason } = req.body;
            const patientId = req.user.id;
            
            if (!doctorId || !startTime || !endTime) {
                res.status(StatusCode.BAD_REQUEST).json({ message: "Doctor ID, start time, and end time are required" });
                return;
            }

            const appointment = await this.bookSlotUseCase.execute({ 
                doctorId, 
                patientId, 
                startTime: new Date(startTime), 
                endTime: new Date(endTime),
                reason 
            });

            res.status(StatusCode.CREATED).json({ 
                message: "Slot booked successfully",
                appointment 
            });
        } catch (error) {
            next(error);
        }
    }
}
