import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { env as config } from "@/shared/config/env";
import { ConsultationSignalingHandler } from "./ConsultationSignalingHandler";

export class SocketService {
  private io: Server | null = null;
  private signalingHandler: ConsultationSignalingHandler | null = null;

  initialize(server: HttpServer, signalingHandler?: ConsultationSignalingHandler) {
    this.io = new Server(server, {
      cors: {
        origin: config.ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    if (signalingHandler) {
      this.signalingHandler = signalingHandler;
      signalingHandler.attach(this.io);
    } else {
      this.io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId as string;
        if (userId && userId !== "undefined") {
          socket.join(userId);
        }
        socket.on("disconnect", () => {});
      });
    }
  }

  getIO(): Server | null {
    return this.io;
  }

  emitToRoom(roomId: string, event: string, data: unknown) {
    this.io?.to(roomId).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.io?.to(userId).emit(event, data);
  }

  sendNotification(userId: string, data: unknown) {
    if (this.io) {
      this.io.to(userId).emit("notification_received", data);
    }
  }

  sendUnreadCountUpdate(userId: string, count: number) {
    if (this.io) {
      this.io.to(userId).emit("unread_count_updated", { count });
    }
  }

  emitQueueUpdated(doctorId: string, date: Date, queue: unknown[]) {
    if (this.io) {
      const dateStr = date.toISOString().split("T")[0];
      this.io.to(doctorId).emit("queue_updated", { doctorId, date: dateStr, queue });
    }
  }

  emitAppointmentBooked(doctorId: string, appointment: unknown) {
    if (this.io) {
      this.io.to(doctorId).emit("appointment_booked", appointment);
    }
  }

  emitStatusChanged(userId: string, appointmentId: string, status: string) {
    if (this.io) {
      this.io.to(userId).emit("appointment_status_changed", { appointmentId, status });
    }
  }
}

export const socketService = new SocketService();
