import { Request, Response } from "express";
import { GetAvailableSlotCase } from "@/application/use-cases/slot/getAvailableSlots.usecase";
import { StatusCode } from "@/shared/constants";

export class DoctorSlotController {
  constructor(
    private readonly getSlotsUseCase: GetAvailableSlotCase
  ) {}

  async getSlots(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { doctorId, date: dateParam } = req.query;

      if (!doctorId || typeof doctorId !== "string" || typeof dateParam !== "string") {
        res.status(StatusCode.BAD_REQUEST).json({ message: "Missing or invalid doctorId or date query params" });
        return;
      }

      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "Invalid date format. Use YYYY-MM-DD." });
        return;
      }

      const slots = await this.getSlotsUseCase.execute({ 
        doctorId, 
        date 
      });

      res.status(StatusCode.OK).json(slots);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Unknown error" });
      }
    }
  }
}
