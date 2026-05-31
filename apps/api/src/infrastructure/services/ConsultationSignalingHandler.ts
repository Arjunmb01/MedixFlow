import { Server, Socket } from "socket.io";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { IConsultationRoomService } from "@/domain/services/IConsultationRoomService";
import { IConsultationSessionRepository } from "@/domain/repositories/IConsultationSessionRepository";
import { ConsultationAccessPolicy } from "@/application/services/ConsultationAccessPolicy";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: UserRole;
    roomId?: string;
    peerId?: string;
  };
}

export class ConsultationSignalingHandler {
  private readonly peerSockets = new Map<string, Set<string>>();
  private io: Server | null = null;

  constructor(
    private readonly getIO: () => Server | null,
    private readonly tokenService: ITokenService,
    private readonly roomService: IConsultationRoomService,
    private readonly sessionRepo: IConsultationSessionRepository,
    private readonly accessPolicy: ConsultationAccessPolicy
  ) {}

  attach(io: Server) {
    this.io = io;
    this.register();
  }

  register() {
    const io = this.io;
    if (!io) return;

    io.use((socket, next) => {
      const token =
        (socket.handshake.auth?.token as string) ||
        (socket.handshake.query?.token as string);
      const legacyUserId = socket.handshake.query?.userId as string;

      if (token) {
        try {
          const payload = this.tokenService.verifyAccessToken(token);
          socket.data.userId = payload.id;
          socket.data.role = payload.role as UserRole;
          return next();
        } catch {
          return next(new Error("Invalid token"));
        }
      }

      if (legacyUserId && legacyUserId !== "undefined") {
        socket.data.userId = legacyUserId;
        socket.data.role = UserRole.PATIENT;
        return next();
      }

      return next(new Error("Authentication required"));
    });

    io.on("connection", (rawSocket) => {
      const socket = rawSocket as AuthenticatedSocket;
      const { userId, role } = socket.data;

      if (userId) {
        socket.join(userId);
      }

      socket.on("join-room", async (payload: { roomId: string }, ack?: (r: unknown) => void) => {
        try {
          const { roomId } = payload;
          const session = await this.accessPolicy.assertRoomAccess(roomId, userId, role);
          const room = await this.roomService.getRoom(roomId);
          if (!room) {
            ack?.({ ok: false, error: "Room not found" });
            return;
          }

          if (role === UserRole.PATIENT && !room.patientAdmitted && room.status !== "IN_CALL") {
            const conflict = await this.roomService.setUserRoom(userId, roomId, socket.id);
            if (conflict && conflict !== roomId) {
              ack?.({ ok: false, error: "Already in another consultation" });
              return;
            }
            socket.join(roomId);
            socket.data.roomId = roomId;
            await this.roomService.updateRoom(roomId, { patientJoined: true });
            await this.sessionRepo.upsertParticipant({
              sessionId: session.id,
              userId,
              role: "PATIENT",
              joinedAt: new Date(),
              socketId: socket.id,
            });
            io.to(roomId).emit("waiting-room-update", {
              patientJoined: true,
              doctorJoined: room.doctorJoined,
              patientAdmitted: room.patientAdmitted,
            });
            ack?.({ ok: true, waiting: true, room });
            return;
          }

          const conflict = await this.roomService.setUserRoom(userId, roomId, socket.id);
          if (conflict && conflict !== roomId) {
            ack?.({ ok: false, error: "Already in another consultation" });
            return;
          }

          socket.join(roomId);
          socket.data.roomId = roomId;
          this.trackPeer(roomId, socket.id);

          const isDoctor = role === UserRole.DOCTOR;
          await this.roomService.updateRoom(roomId, {
            ...(isDoctor ? { doctorJoined: true } : { patientJoined: true }),
          });
          await this.sessionRepo.upsertParticipant({
            sessionId: session.id,
            userId,
            role: isDoctor ? "DOCTOR" : "PATIENT",
            joinedAt: new Date(),
            socketId: socket.id,
          });

          const others = Array.from(io.sockets.adapter.rooms.get(roomId) || []).filter(
            (id) => id !== socket.id && id !== roomId
          );

          socket.to(roomId).emit("user-connected", { userId, role, socketId: socket.id });
          ack?.({
            ok: true,
            room,
            existingParticipants: others.length,
            canStartCall: room.patientAdmitted && room.status === "IN_CALL",
          });
        } catch (e) {
          ack?.({ ok: false, error: (e as Error).message });
        }
      });

      socket.on("leave-room", async (payload: { roomId: string }) => {
        const roomId = payload?.roomId || socket.data.roomId;
        if (!roomId) return;
        socket.leave(roomId);
        this.untrackPeer(roomId, socket.id);
        await this.roomService.clearUserRoom(userId, roomId);
        socket.to(roomId).emit("user-disconnected", { userId, socketId: socket.id });
        socket.data.roomId = undefined;
      });

      const relay = (event: string) => {
        socket.on(event, (data: Record<string, unknown> & { roomId?: string; targetSocketId?: string }) => {
          const roomId = data?.roomId || socket.data.roomId;
          if (!roomId) return;
          const target = data.targetSocketId;
          if (target) {
            io.to(target).emit(event, { ...data, from: socket.id, userId });
          } else {
            socket.to(roomId).emit(event, { ...data, from: socket.id, userId });
          }
        });
      };

      relay("offer");
      relay("answer");
      relay("ice-candidate");

      socket.on("disconnect", async () => {
        const roomId = socket.data.roomId;
        if (roomId) {
          this.untrackPeer(roomId, socket.id);
          await this.roomService.clearUserRoom(userId, roomId);
          socket.to(roomId).emit("user-disconnected", { userId, socketId: socket.id });
        }
      });
    });
  }

  private trackPeer(roomId: string, socketId: string) {
    if (!this.peerSockets.has(roomId)) {
      this.peerSockets.set(roomId, new Set());
    }
    this.peerSockets.get(roomId)!.add(socketId);
  }

  private untrackPeer(roomId: string, socketId: string) {
    this.peerSockets.get(roomId)?.delete(socketId);
    if (this.peerSockets.get(roomId)?.size === 0) {
      this.peerSockets.delete(roomId);
    }
  }
}
