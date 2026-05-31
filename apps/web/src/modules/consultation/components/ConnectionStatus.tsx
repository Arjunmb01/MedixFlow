import type { ConnectionPhase } from "@/application/consultation/hooks/useConsultationSocket";

interface Props {
  phase: ConnectionPhase;
}

const labels: Record<ConnectionPhase, string> = {
  idle: "",
  connecting: "Connecting...",
  connected: "Connected",
  reconnecting: "Reconnecting...",
  disconnected: "Connection lost",
};

export default function ConnectionStatus({ phase }: Props) {
  if (phase === "idle" || phase === "connected") return null;

  const isError = phase === "disconnected";
  const isReconnecting = phase === "reconnecting";

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
        isError
          ? "bg-red-600 text-white"
          : isReconnecting
            ? "bg-amber-500 text-white"
            : "bg-primary-600 text-white"
      }`}
    >
      {labels[phase]}
    </div>
  );
}
