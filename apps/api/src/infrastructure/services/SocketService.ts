import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { env as config } from "@/shared/config/env";

export class SocketService {
  private io: Server | null = null;

  initialize(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: config.ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ["websocket", "polling"]
    });

    this.io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId as string;
      

      if (userId && userId !== "undefined") {
        socket.join(userId);
      } else {
        console.warn(`[SocketService] Socket connected (id=${socket.id}) but no valid userId provided in query`);
      }

      socket.on("disconnect", (reason) => {
        console.log(`[SocketService] User ${userId} (socketId=${socket.id}) disconnected. Reason: ${reason}`);
      });
    });
  }

  sendNotification(userId: string, data: any) {
    if (this.io) {
      this.io.to(userId).emit("notification_received", data);
      console.log(`[SocketService] Notification emitted to room=${userId}`);
    } else {
      console.error("[SocketService] Cannot send notification: io server not initialized");
    }
  }

  sendUnreadCountUpdate(userId: string, count: number) {
    if (this.io) {
      this.io.to(userId).emit("unread_count_updated", { count });
      console.log(`[SocketService] Unread count update emitted to room=${userId}`);
    } else {
      console.error("[SocketService] Cannot send unread count update: io server not initialized");
    }
  }

  emitQueueUpdated(doctorId: string, date: Date, queue: any[]) {
    if (this.io) {
      const dateStr = date.toISOString().split("T")[0];
      this.io.to(doctorId).emit("queue_updated", { doctorId, date: dateStr, queue });
    }
  }

  emitAppointmentBooked(doctorId: string, appointment: any) {
    if (this.io) {
      this.io.to(doctorId).emit("appointment_booked", appointment);
    }
  }

  emitStatusChanged(userId: string, appointmentId: string, status: string) {
    if (this.io) {
      this.io.to(userId).emit("appointment_status_changed", { appointmentId, status });
    }
  }

  emitToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(userId).emit(event, data);
      console.log(`[SocketService] Event '${event}' emitted to user=${userId}`);
    }
  }
}

export const socketService = new SocketService();
