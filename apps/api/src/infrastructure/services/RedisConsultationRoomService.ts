import redisClient from "./redisClient";
import {
  ConsultationRoomState,
  ConsultationSessionStatus,
} from "@/domain/value-objects/types/consultationSession.types";
import { IConsultationRoomService } from "@/domain/services/IConsultationRoomService";

const ROOM_PREFIX = "consultation:room:";
const USER_PREFIX = "consultation:user:";
const LOCK_PREFIX = "consultation:lock:";
const ROOM_TTL_SECONDS = 4 * 60 * 60;

export class RedisConsultationRoomService implements IConsultationRoomService {
  private roomKey(roomId: string) {
    return `${ROOM_PREFIX}${roomId}`;
  }

  private userKey(userId: string) {
    return `${USER_PREFIX}${userId}`;
  }

  private lockKey(appointmentId: string) {
    return `${LOCK_PREFIX}${appointmentId}`;
  }

  async getRoom(roomId: string): Promise<ConsultationRoomState | null> {
    const data = await redisClient.hGetAll(this.roomKey(roomId));
    if (!data || !data.roomId) return null;
    return {
      roomId: data.roomId,
      sessionId: data.sessionId,
      appointmentId: data.appointmentId,
      doctorId: data.doctorId,
      patientId: data.patientId,
      doctorJoined: data.doctorJoined === "true",
      patientJoined: data.patientJoined === "true",
      patientAdmitted: data.patientAdmitted === "true",
      startedAt: data.startedAt || null,
      status: data.status as ConsultationSessionStatus,
    };
  }

  async createRoom(state: ConsultationRoomState): Promise<void> {
    const key = this.roomKey(state.roomId);
    await redisClient.hSet(key, {
      roomId: state.roomId,
      sessionId: state.sessionId,
      appointmentId: state.appointmentId,
      doctorId: state.doctorId,
      patientId: state.patientId,
      doctorJoined: String(state.doctorJoined),
      patientJoined: String(state.patientJoined),
      patientAdmitted: String(state.patientAdmitted),
      startedAt: state.startedAt ?? "",
      status: state.status,
    });
    await redisClient.expire(key, ROOM_TTL_SECONDS);
  }

  async updateRoom(
    roomId: string,
    patch: Partial<ConsultationRoomState>
  ): Promise<ConsultationRoomState | null> {
    const current = await this.getRoom(roomId);
    if (!current) return null;
    const next = { ...current, ...patch };
    await this.createRoom(next);
    return next;
  }

  async setUserRoom(userId: string, roomId: string, socketId: string): Promise<string | null> {
    const key = this.userKey(userId);
    const existing = await redisClient.get(key);
    if (existing && existing !== roomId) {
      return existing;
    }
    await redisClient.set(key, `${roomId}:${socketId}`, { EX: ROOM_TTL_SECONDS });
    return null;
  }

  async clearUserRoom(userId: string, roomId: string): Promise<void> {
    const key = this.userKey(userId);
    const existing = await redisClient.get(key);
    if (existing?.startsWith(`${roomId}:`)) {
      await redisClient.del(key);
    }
  }

  async lockAppointment(appointmentId: string, roomId: string): Promise<boolean> {
    const result = await redisClient.set(this.lockKey(appointmentId), roomId, {
      NX: true,
      EX: ROOM_TTL_SECONDS,
    });
    return result === "OK";
  }

  async releaseAppointment(appointmentId: string): Promise<void> {
    await redisClient.del(this.lockKey(appointmentId));
  }

  async cleanupRoom(
    roomId: string,
    appointmentId: string,
    doctorId: string,
    patientId: string
  ): Promise<void> {
    await redisClient.del(this.roomKey(roomId));
    await redisClient.del(this.userKey(doctorId));
    await redisClient.del(this.userKey(patientId));
    await this.releaseAppointment(appointmentId);
  }

  async setRoomStatus(roomId: string, status: ConsultationSessionStatus): Promise<void> {
    const key = this.roomKey(roomId);
    await redisClient.hSet(key, { status });
    await redisClient.expire(key, ROOM_TTL_SECONDS);
  }
}
