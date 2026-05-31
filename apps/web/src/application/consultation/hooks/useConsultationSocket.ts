import { useEffect, useRef, useCallback, useState } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export type ConnectionPhase = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";

export interface UseConsultationSocketOptions {
  accessToken: string | null;
  enabled?: boolean;
  onConsultationStarted?: (payload: { roomId: string; sessionId: string }) => void;
  onConsultationEnded?: (payload: unknown) => void;
  onPatientAdmitted?: (payload: { roomId: string; sessionId: string }) => void;
  onWaitingRoomUpdate?: (payload: unknown) => void;
  onUserConnected?: (payload: { userId: string; role: string; socketId: string }) => void;
  onUserDisconnected?: (payload: { userId: string; socketId: string }) => void;
  onChat?: (message: unknown) => void;
}

export function useConsultationSocket(options: UseConsultationSocketOptions) {
  const { accessToken, enabled = true } = options;

  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(options);
  handlersRef.current = options;

  const [phase, setPhase] = useState<ConnectionPhase>("idle");

  const connect = useCallback(() => {
    if (!accessToken || !enabled) return null;

    if (socketRef.current?.connected) return socketRef.current;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => setPhase("connected"));
    socket.io.on("reconnect_attempt", () => setPhase("reconnecting"));
    socket.io.on("reconnect", () => setPhase("connected"));
    socket.on("disconnect", () => setPhase("disconnected"));
    socket.on("connect_error", () => setPhase("disconnected"));

    socket.on("consultation-started", (p) => handlersRef.current.onConsultationStarted?.(p));
    socket.on("consultation-ended", (p) => handlersRef.current.onConsultationEnded?.(p));
    socket.on("patient-admitted", (p) => handlersRef.current.onPatientAdmitted?.(p));
    socket.on("waiting-room-update", (p) => handlersRef.current.onWaitingRoomUpdate?.(p));
    socket.on("user-connected", (p) => handlersRef.current.onUserConnected?.(p));
    socket.on("user-disconnected", (p) => handlersRef.current.onUserDisconnected?.(p));
    socket.on("consultation-chat", (p) => handlersRef.current.onChat?.(p));

    socketRef.current = socket;
    setPhase("connecting");
    return socket;
  }, [accessToken, enabled]);

  useEffect(() => {
    if (!enabled || !accessToken) return;
    const socket = connect();
    return () => {
      socket?.removeAllListeners();
      socket?.disconnect();
      socketRef.current = null;
      setPhase("idle");
    };
  }, [accessToken, enabled, connect]);

  const joinRoom = useCallback(
    (roomId: string): Promise<{ ok: boolean; waiting?: boolean; error?: string }> =>
      new Promise((resolve) => {
        const socket = socketRef.current ?? connect();
        if (!socket) {
          resolve({ ok: false, error: "Socket not connected" });
          return;
        }
        socket.emit("join-room", { roomId }, (response: { ok: boolean; waiting?: boolean; error?: string }) => {
          resolve(response ?? { ok: false, error: "No response" });
        });
      }),
    [connect]
  );

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.emit("leave-room", { roomId });
  }, []);

  const emitSignal = useCallback(
    (event: "offer" | "answer" | "ice-candidate", payload: Record<string, unknown>) => {
      socketRef.current?.emit(event, payload);
    },
    []
  );

  return {
    socket: socketRef,
    phase,
    joinRoom,
    leaveRoom,
    emitSignal,
    connect,
  };
}
