import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/shared/middlewares/auth.middleware";
import { JoinVideoWaitingRoomUseCase } from "@/application/use-cases/consultation/JoinVideoWaitingRoomUseCase";
import { StartVideoConsultationUseCase } from "@/application/use-cases/consultation/StartVideoConsultationUseCase";
import { AdmitPatientUseCase } from "@/application/use-cases/consultation/AdmitPatientUseCase";
import { EndVideoConsultationUseCase } from "@/application/use-cases/consultation/EndVideoConsultationUseCase";
import { GetVideoSessionStateUseCase } from "@/application/use-cases/consultation/GetVideoSessionStateUseCase";
import { SendConsultationChatUseCase } from "@/application/use-cases/consultation/SendConsultationChatUseCase";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { z } from "zod";

const appointmentIdSchema = z.object({ appointmentId: z.string().uuid() });
const sessionIdSchema = z.object({ sessionId: z.string().uuid() });
const chatSchema = z.object({ message: z.string().min(1).max(2000) });
const endSchema = z.object({ summary: z.string().max(5000).optional() });

export class VideoConsultationController {
  constructor(
    private readonly joinWaitingRoom: JoinVideoWaitingRoomUseCase,
    private readonly startConsultation: StartVideoConsultationUseCase,
    private readonly admitPatient: AdmitPatientUseCase,
    private readonly endConsultation: EndVideoConsultationUseCase,
    private readonly getSessionState: GetVideoSessionStateUseCase,
    private readonly sendChatUseCase: SendConsultationChatUseCase
  ) {}

  patientJoinWaitingRoom = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { appointmentId } = appointmentIdSchema.parse(req.params);
      const result = await this.joinWaitingRoom.execute(appointmentId, req.user.id);
      res.json({ message: "Joined waiting room", data: result });
    } catch (error) {
      next(error);
    }
  };

  doctorStart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { appointmentId } = appointmentIdSchema.parse(req.params);
      const admit = req.body?.admitPatient !== false;
      const result = await this.startConsultation.execute(appointmentId, req.user.id, admit);
      res.json({ message: "Consultation started", data: result });
    } catch (error) {
      next(error);
    }
  };

  doctorAdmit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = sessionIdSchema.parse(req.params);
      const session = await this.admitPatient.execute(sessionId, req.user.id);
      res.json({ message: "Patient admitted", data: session });
    } catch (error) {
      next(error);
    }
  };

  end = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = sessionIdSchema.parse(req.params);
      const { summary } = endSchema.parse(req.body ?? {});
      const session = await this.endConsultation.execute(sessionId, req.user.id, summary);
      res.json({ message: "Consultation ended", data: session });
    } catch (error) {
      next(error);
    }
  };

  getState = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const appointmentId = req.query.appointmentId as string | undefined;
      const sessionId = req.query.sessionId as string | undefined;
      const state = await this.getSessionState.execute({
        appointmentId,
        sessionId,
        userId: req.user.id,
        role: req.user.role as UserRole,
      });
      res.json(state);
    } catch (error) {
      next(error);
    }
  };

  sendChatMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = sessionIdSchema.parse(req.params);
      const { message } = chatSchema.parse(req.body);
      const chat = await this.sendChatUseCase.execute(
        sessionId,
        req.user.id,
        req.user.role as UserRole,
        message
      );
      res.json({ data: chat });
    } catch (error) {
      next(error);
    }
  };
}
