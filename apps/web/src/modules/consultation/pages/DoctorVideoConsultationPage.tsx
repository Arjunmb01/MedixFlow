import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/store/store";
import { UserRole } from "@/domain/auth/types/auth.types";
import {
  startVideoConsultation,
  admitPatient,
  endVideoConsultation,
  getVideoSessionState,
  sendConsultationChat,
} from "@/infrastructure/api/videoConsultation.api";
import { useConsultationSocket } from "@/application/consultation/hooks/useConsultationSocket";
import { useWebRTC } from "@/application/consultation/hooks/useWebRTC";
import VideoGrid from "../components/VideoGrid";
import WaitingRoom from "../components/WaitingRoom";
import ConnectionStatus from "../components/ConnectionStatus";
import MediaControls from "../components/MediaControls";
import ConsultationChat, { type ChatMessage } from "../components/ConsultationChat";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function DoctorVideoConsultationPage() {
  const { appointmentId = "" } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((s: RootState) => s.auth[UserRole.DOCTOR]);
  const userId = auth.user?.id ?? "";
  const accessToken = auth.accessToken;

  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);
  const [patientAdmitted, setPatientAdmitted] = useState(false);
  const [patientJoined, setPatientJoined] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const socket = useConsultationSocket({
    accessToken,
    enabled: !!accessToken,
    onConsultationStarted: () => setPatientAdmitted(true),
    onWaitingRoomUpdate: (payload) => {
      const p = payload as { patientJoined?: boolean; patientAdmitted?: boolean };
      if (p.patientJoined) setPatientJoined(true);
      if (p.patientAdmitted) setPatientAdmitted(true);
    },
    onUserConnected: async (payload) => {
      const { socketId, role } = payload as { socketId: string; role: string };
      if (role === "PATIENT" && inCall) {
        webrtc.setRemoteSocketId(socketId);
        await webrtc.createOffer(socketId);
      }
    },
    onChat: (msg) => setChat((prev) => [...prev, msg as ChatMessage]),
  });

  const webrtc = useWebRTC(true, socket.emitSignal, roomId);

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

  const startSession = useCallback(
    async (admit: boolean) => {
      const res = await startVideoConsultation(appointmentId, admit);
      setRoomId(res.data.session.roomId);
      setSessionId(res.data.session.id);
      setConsultationId(res.data.consultation?.id ?? null);
      setPatientAdmitted(admit);
      if (admit) setInCall(true);
    },
    [appointmentId]
  );

  useEffect(() => {
    if (!appointmentId) return;
    (async () => {
      try {
        const recovery = await getVideoSessionState({ appointmentId });
        if (recovery.session) {
          setRoomId(recovery.session.roomId);
          setSessionId(recovery.session.id);
          setPatientAdmitted(recovery.room?.patientAdmitted ?? false);
          setPatientJoined(recovery.room?.patientJoined ?? false);
          setInCall(recovery.session.status === "IN_CALL");
          setChat(recovery.chat ?? []);
        } else {
          await startSession(false);
        }
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg ?? "Unable to start consultation");
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId, startSession]);

  useEffect(() => {
    if (!roomId || !accessToken) return;
    socket.connect();
    void (async () => {
      await webrtc.startLocalMedia();
      await socket.joinRoom(roomId);
      if (inCall) wireSignaling();
    })();
  }, [roomId, accessToken, inCall, socket, webrtc, wireSignaling]);

  const handleAdmit = async () => {
    if (!sessionId) return;
    await admitPatient(sessionId);
    setPatientAdmitted(true);
    setInCall(true);
    await socket.joinRoom(roomId!);
    wireSignaling();
  };

  const handleEnd = async () => {
    if (!sessionId) return;
    await endVideoConsultation(sessionId, notes || undefined);
    if (roomId) socket.leaveRoom(roomId);
    webrtc.cleanup();
    toast.success("Consultation ended");
    navigate(consultationId ? `/doctor/workspace/${consultationId}` : "/doctor/appointments");
  };

  const handleSendChat = async (message: string) => {
    if (!sessionId) return;
    await sendConsultationChat(sessionId, message, "doctor");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-bold">{error}</p>
        <button type="button" onClick={() => navigate("/doctor/appointments")} className="text-primary-600 font-bold">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ConnectionStatus phase={socket.phase} />
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {!patientAdmitted ? (
            <div className="space-y-4">
              <WaitingRoom
                doctorJoined
                patientAdmitted={false}
                title="Consultation lobby"
              />
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => void handleAdmit()}
                  disabled={!patientJoined}
                  className="px-6 py-3 rounded-2xl bg-primary-600 text-white font-bold disabled:opacity-50"
                >
                  Admit patient
                </button>
                {!patientJoined && (
                  <p className="text-sm text-gray-500 self-center">Waiting for patient to join waiting room</p>
                )}
              </div>
            </div>
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
              onEndCall={() => void handleEnd()}
              endLabel="End consultation"
            />
          )}
        </div>
        <div className="space-y-4">
          {sessionId && (
            <ConsultationChat messages={chat} onSend={handleSendChat} currentUserId={userId} />
          )}
          <div className="bg-white rounded-2xl border p-4">
            <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
              Consultation notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full h-24 rounded-xl border p-3 text-sm"
              placeholder="Summary for patient record..."
            />
          </div>
          {consultationId && (
            <Link
              to={`/doctor/workspace/${consultationId}`}
              className="flex items-center gap-2 text-primary-600 font-bold text-sm"
            >
              <FileText className="w-4 h-4" />
              Open EMR workspace
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
