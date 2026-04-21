import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export class SocketService {
  private io: Server | null = null;

  initialize(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ["websocket", "polling"]
    });

    this.io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId as string;
      
      console.log(`[SocketService] New connection attempt: socketId=${socket.id}, userId=${userId}`);

      if (userId && userId !== "undefined") {
        socket.join(userId);
        console.log(`[SocketService] User joined room: ${userId}`);
      } else {
        console.warn(`[SocketService] Socket connected (id=${socket.id}) but no valid userId provided in query`);
      }

      socket.on("disconnect", (reason) => {
        console.log(`[SocketService] User ${userId} (socketId=${socket.id}) disconnected. Reason: ${reason}`);
      });
    });
  }

  sendNotification(userId: string, data: any) {
    console.log(`[SocketService] Attempting to send notification to userId=${userId}, type=${data?.type}`);
    if (this.io) {
      this.io.to(userId).emit("notification_received", data);
      console.log(`[SocketService] Notification emitted to room=${userId}`);
    } else {
      console.error("[SocketService] Cannot send notification: io server not initialized");
    }
  }

  sendUnreadCountUpdate(userId: string, count: number) {
    console.log(`[SocketService] Attempting to send unread count update to userId=${userId}, count=${count}`);
    if (this.io) {
      this.io.to(userId).emit("unread_count_updated", { count });
      console.log(`[SocketService] Unread count update emitted to room=${userId}`);
    } else {
      console.error("[SocketService] Cannot send unread count update: io server not initialized");
    }
  }
}

export const socketService = new SocketService();
