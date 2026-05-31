import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/store/store";
import { UserRole } from "@/domain/auth/types/auth.types";
import {
  joinVideoWaitingRoom,
  getPatientVideoSessionState,
  sendConsultationChat,
} from "@/infrastructure/api/videoConsultation.api";
import { useConsultationSocket } from "@/application/consultation/hooks/useConsultationSocket";
import { useWebRTC } from "@/application/consultation/hooks/useWebRTC";
import VideoGrid from "../components/VideoGrid";
import WaitingRoom from "../components/WaitingRoom";
import ConnectionStatus from "../components/ConnectionStatus";
import MediaControls from "../components/MediaControls";
import ConsultationChat, { type ChatMessage } from "../components/ConsultationChat";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PatientVideoConsultationPage() {
  const { appointmentId = "" } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((s: RootState) => s.auth[UserRole.PATIENT]);
  const userId = auth.user?.id ?? "";
  const accessToken = auth.accessToken;

  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);
  const [doctorJoined, setDoctorJoined] = useState(false);
  const [patientAdmitted, setPatientAdmitted] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socket = useConsultationSocket({
    accessToken,
    enabled: !!accessToken,
    onConsultationStarted: () => {
      setPatientAdmitted(true);
      setInCall(true);
    },
    onPatientAdmitted: () => {
      setPatientAdmitted(true);
      setInCall(true);
    },
    onWaitingRoomUpdate: (payload) => {
      const p = payload as { doctorJoined?: boolean; patientAdmitted?: boolean };
      if (p.doctorJoined) setDoctorJoined(true);
      if (p.patientAdmitted) {
        setPatientAdmitted(true);
        setInCall(true);
      }
    },
    onConsultationEnded: () => {
      toast.info("Consultation ended by doctor");
      navigate("/appointments");
    },
    onChat: (msg) => setChat((prev) => [...prev, msg as ChatMessage]),
  });

  const webrtc = useWebRTC(false, socket.emitSignal, roomId);

  const wireSignaling = useCallback(() => {
    const s = socket.socket.current;
    if (!s) return;
    const onOffer = async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      await webrtc.handleRemoteOffer(data.offer, data.from);
    };
    const onAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
      await webrtc.handleRemoteAnswer(data.answer);
    };
    const onIce = async (data: { candidate: RTCIceCandidateInit }) => {
      await webrtc.handleRemoteIce(data.candidate);
    };
    s.on("offer", onOffer);
    s.on("answer", onAnswer);
    s.on("ice-candidate", onIce);
    return () => {
      s.off("offer", onOffer);
      s.off("answer", onAnswer);
      s.off("ice-candidate", onIce);
    };
  }, [socket.socket, webrtc]);

  const enterCall = useCallback(async () => {
    if (!roomId) return;
    await webrtc.startLocalMedia();
    const join = await socket.joinRoom(roomId);
    if (!join.ok) {
      toast.error(join.error ?? "Failed to join room");
      return;
    }
    if (!join.waiting) {
      setInCall(true);
      wireSignaling();
    }
  }, [roomId, socket, webrtc, wireSignaling]);

  useEffect(() => {
    if (!appointmentId) return;
    (async () => {
      try {
        const recovery = await getPatientVideoSessionState({ appointmentId });
        if (recovery.session) {
          setRoomId(recovery.session.roomId);
          setSessionId(recovery.session.id);
          setDoctorJoined(recovery.room?.doctorJoined ?? false);
          const admitted =
            recovery.room?.patientAdmitted || recovery.session.status === "IN_CALL";
          setPatientAdmitted(admitted);
          setInCall(admitted);
          setChat(recovery.chat ?? []);
        } else {
          const res = await joinVideoWaitingRoom(appointmentId);
          setRoomId(res.data.session.roomId);
          setSessionId(res.data.session.id);
          setDoctorJoined(res.data.room?.doctorJoined ?? false);
        }
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg ?? "Unable to join consultation");
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId]);

  useEffect(() => {
    if (!roomId || !accessToken) return;
    socket.connect();
    void socket.joinRoom(roomId);
  }, [roomId, accessToken, socket]);

  useEffect(() => {
    if (patientAdmitted && roomId) {
      void enterCall();
    }
  }, [patientAdmitted, roomId, enterCall]);

  useEffect(() => {
    if (socket.phase === "connected" && inCall) {
      return wireSignaling();
    }
  }, [socket.phase, inCall, wireSignaling]);

  useEffect(() => {
    if (socket.phase === "reconnecting" && inCall && roomId) {
      void socket.joinRoom(roomId).then(() => webrtc.restartIce());
    }
  }, [socket.phase, inCall, roomId, socket, webrtc]);

  const handleSendChat = async (message: string) => {
    if (!sessionId) return;
    await sendConsultationChat(sessionId, message, "patient");
  };

  const showWaiting = useMemo(() => !patientAdmitted, [patientAdmitted]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-600 font-bold">{error}</p>
        <button type="button" onClick={() => navigate("/appointments")} className="text-primary-600 font-bold">
          Back to appointments
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ConnectionStatus phase={socket.phase} />
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {showWaiting ? (
            <WaitingRoom doctorJoined={doctorJoined} patientAdmitted={patientAdmitted} />
          ) : (
            <VideoGrid localStream={webrtc.localStream} remoteStream={webrtc.remoteStream} />
          )}
          {patientAdmitted && (
            <MediaControls
              cameraEnabled={webrtc.cameraEnabled}
              micEnabled={webrtc.micEnabled}
              isScreenSharing={webrtc.isScreenSharing}
              onToggleCamera={webrtc.toggleCamera}
              onToggleMic={webrtc.toggleMic}
              onToggleScreen={webrtc.toggleScreenShare}
              onEndCall={() => {
                if (roomId) socket.leaveRoom(roomId);
                webrtc.cleanup();
                navigate("/appointments");
              }}
              endLabel="Leave"
            />
          )}
        </div>
        <div className="h-[480px]">
          {sessionId && (
            <ConsultationChat messages={chat} onSend={handleSendChat} currentUserId={userId} />
          )}
        </div>
      </div>
    </div>
  );
}
