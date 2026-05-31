import { ConsultationRoomState, ConsultationSessionStatus } from "../value-objects/types/consultationSession.types";

export interface IConsultationRoomService {
  getRoom(roomId: string): Promise<ConsultationRoomState | null>;
  createRoom(state: ConsultationRoomState): Promise<void>;
  updateRoom(roomId: string, patch: Partial<ConsultationRoomState>): Promise<ConsultationRoomState | null>;
  setUserRoom(userId: string, roomId: string, socketId: string): Promise<string | null>;
  clearUserRoom(userId: string, roomId: string): Promise<void>;
  lockAppointment(appointmentId: string, roomId: string): Promise<boolean>;
  releaseAppointment(appointmentId: string): Promise<void>;
  cleanupRoom(roomId: string, appointmentId: string, doctorId: string, patientId: string): Promise<void>;
  setRoomStatus(roomId: string, status: ConsultationSessionStatus): Promise<void>;
}
