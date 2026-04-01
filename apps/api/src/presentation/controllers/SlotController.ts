import { Request, Response, NextFunction } from "express";
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

    bookSlot = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { slotId } = req.body;
            const patientId = req.user.id;
            await this.bookSlotUseCase.execute({ slotId, patientId });
            res.status(StatusCode.OK).json({ message: "Slot booked successfully" });
        } catch (error) {
            next(error);
        }
    }
}
