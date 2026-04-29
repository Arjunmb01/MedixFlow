import { Request, Response, NextFunction } from "express";
import { StatusCode } from "@/shared/constants";
import { ApplyLeaveUseCase } from "@/application/use-cases/leave/ApplyLeaveUseCase";
import { GetMyLeavesUseCase } from "@/application/use-cases/leave/GetMyLeavesUseCase";
import { CancelLeaveUseCase } from "@/application/use-cases/leave/CancelLeaveUseCase";
import { GetAllLeavesUseCase } from "@/application/use-cases/leave/GetAllLeavesUseCase";
import { ReviewLeaveUseCase } from "@/application/use-cases/leave/ReviewLeaveUseCase";
import { LeaveStatus } from "@/domain/entities/DoctorLeave";
import { z } from "zod";

const applyLeaveSchema = z.object({
  startDate: z.string().datetime({ offset: true }).or(z.string().date()),
  endDate: z.string().datetime({ offset: true }).or(z.string().date()),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  suppressConflicts: z.boolean().optional(),
});

const reviewLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export class LeaveController {
  constructor(
    private readonly applyLeaveUseCase: ApplyLeaveUseCase,
    private readonly getMyLeavesUseCase: GetMyLeavesUseCase,
    private readonly cancelLeaveUseCase: CancelLeaveUseCase,
    private readonly getAllLeavesUseCase: GetAllLeavesUseCase,
    private readonly reviewLeaveUseCase: ReviewLeaveUseCase
  ) {}

  applyLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = (req as any).user?.id;
      const body = applyLeaveSchema.parse(req.body);
      const result = await this.applyLeaveUseCase.execute(doctorId, {
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        reason: body.reason,
        suppressConflicts: body.suppressConflicts,
      });
      res.status(StatusCode.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMyLeaves = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = (req as any).user?.id;
      const result = await this.getMyLeavesUseCase.execute(doctorId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  cancelLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = (req as any).user?.id;
      const leaveId = z.string().uuid().parse(req.params.id);
      const result = await this.cancelLeaveUseCase.execute(leaveId, doctorId);
      res.json({ message: "Leave cancelled successfully.", leave: result });
    } catch (error) {
      next(error);
    }
  };

  getAllLeaves = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, search, page, limit } = req.query;
      const result = await this.getAllLeavesUseCase.execute({
        status: status as any,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  reviewLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leaveId = z.string().uuid().parse(req.params.id);
      const { status } = reviewLeaveSchema.parse(req.body);
      const result = await this.reviewLeaveUseCase.execute(leaveId, {
        status: status as LeaveStatus.APPROVED | LeaveStatus.REJECTED,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
