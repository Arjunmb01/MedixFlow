import { Request, Response, NextFunction } from "express";
import { GetAvailableSlotCase } from "@/application/use-cases/slot/getAvailableSlots.usecase";
import { StatusCode } from "@/shared/constants";

export class DoctorSlotController {
  constructor(
    private readonly getSlotsUseCase: GetAvailableSlotCase
  ) {}

  async getSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId, date: dateParam } = req.query;

      console.log(`[DoctorSlotController] Fetching slots - doctorId: ${doctorId}, date: ${dateParam}`);

      if (!doctorId || typeof doctorId !== "string") {
        res.status(StatusCode.BAD_REQUEST).json({ message: "Missing or invalid doctorId query param" });
        return;
      }

      if (!dateParam || typeof dateParam !== "string") {
        res.status(StatusCode.BAD_REQUEST).json({ message: "Missing or invalid date query param" });
        return;
      }

      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "Invalid date format. Expected YYYY-MM-DD" });
        return;
      }

      const slots = await this.getSlotsUseCase.execute({ 
        doctorId, 
        date 
      });

      res.status(StatusCode.OK).json(slots);
    } catch (error: unknown) {
      next(error);
    }
  }
}
