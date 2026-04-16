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
      
      if (userId && userId !== "undefined") {
        socket.join(userId);
      } else {
        console.warn("Socket connected but no valid userId provided in query");
      }

      socket.on("disconnect", (reason) => {
        console.log(`User ${userId} disconnected from socket. Reason: ${reason}`);
      });
    });
  }

  sendNotification(userId: string, data: any) {
    if (this.io) {
      this.io.to(userId).emit("notification_received", data);
    }
  }

  sendUnreadCountUpdate(userId: string, count: number) {
    if (this.io) {
      this.io.to(userId).emit("unread_count_updated", { count });
    }
  }
}

export const socketService = new SocketService();
