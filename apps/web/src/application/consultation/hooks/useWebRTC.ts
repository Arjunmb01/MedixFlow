import { useCallback, useEffect, useRef, useState } from "react";
import { ICE_SERVERS, MEDIA_CONSTRAINTS } from "../constants/webrtc";

export interface WebRTCSignalHandlers {
  onOffer: (offer: RTCSessionDescriptionInit, from: string, targetSocketId?: string) => void;
  onAnswer: (answer: RTCSessionDescriptionInit, from: string) => void;
  onIceCandidate: (candidate: RTCIceCandidateInit, from: string) => void;
}

export function useWebRTC(
  isInitiator: boolean,
  emitSignal: (
    event: "offer" | "answer" | "ice-candidate",
    payload: Record<string, unknown>
  ) => void,
  roomId: string | null
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);
  const makingOfferRef = useRef(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const getPeer = useCallback(() => {
    if (!pcRef.current) {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pc.onicecandidate = (e) => {
        if (!e.candidate || !roomId) return;
        emitSignal("ice-candidate", {
          roomId,
          candidate: e.candidate,
          targetSocketId: remoteSocketIdRef.current ?? undefined,
        });
      };
      pc.ontrack = (e) => {
        setRemoteStream((prev) => {
          const stream = prev ?? new MediaStream();
          e.streams[0]?.getTracks().forEach((t) => {
            if (!stream.getTracks().some((x) => x.id === t.id)) stream.addTrack(t);
          });
          return stream;
        });
      };
      pc.onnegotiationneeded = async () => {
        if (!isInitiator || makingOfferRef.current || pc.signalingState !== "stable") return;
        try {
          makingOfferRef.current = true;
          await pc.setLocalDescription(await pc.createOffer({ iceRestart: false }));
          emitSignal("offer", {
            roomId,
            offer: pc.localDescription,
            targetSocketId: remoteSocketIdRef.current ?? undefined,
          });
        } finally {
          makingOfferRef.current = false;
        }
      };
      pcRef.current = pc;
    }
    return pcRef.current;
  }, [emitSignal, isInitiator, roomId]);

  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      localStreamRef.current = stream;
      setLocalStream(stream);
      const pc = getPeer();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      setMediaError(null);
      return stream;
    } catch (err) {
      setMediaError("Camera/microphone access denied");
      throw err;
    }
  }, [getPeer]);

  const createOffer = useCallback(
    async (targetSocketId?: string) => {
      const pc = getPeer();
      remoteSocketIdRef.current = targetSocketId ?? null;
      if (pc.signalingState === "closed") return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      emitSignal("offer", { roomId, offer, targetSocketId });
    },
    [emitSignal, getPeer, roomId]
  );

  const handleRemoteOffer = useCallback(
    async (offer: RTCSessionDescriptionInit, from: string) => {
      remoteSocketIdRef.current = from;
      const pc = getPeer();
      if (pc.signalingState === "have-local-offer") {
        await pc.setLocalDescription({ type: "rollback" } as RTCSessionDescriptionInit);
      }
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      emitSignal("answer", { roomId, answer, targetSocketId: from });
    },
    [emitSignal, getPeer, roomId]
  );

  const handleRemoteAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      const pc = getPeer();
      if (pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(answer);
      }
    },
    [getPeer]
  );

  const handleRemoteIce = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      try {
        await getPeer().addIceCandidate(candidate);
      } catch {
        /* ignore stale candidates */
      }
    },
    [getPeer]
  );

  const restartIce = useCallback(async () => {
    const pc = getPeer();
    if (pc.signalingState === "closed") return;
    const offer = await pc.createOffer({ iceRestart: true });
    await pc.setLocalDescription(offer);
    emitSignal("offer", {
      roomId,
      offer,
      targetSocketId: remoteSocketIdRef.current ?? undefined,
    });
  }, [emitSignal, getPeer, roomId]);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setCameraEnabled((v) => !v);
  }, []);

  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicEnabled((v) => !v);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const pc = getPeer();
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        await sender?.replaceTrack(camTrack);
      }
      setIsScreenSharing(false);
      return;
    }
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStreamRef.current = screen;
    const screenTrack = screen.getVideoTracks()[0];
    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
    await sender?.replaceTrack(screenTrack);
    screenTrack.onended = () => void toggleScreenShare();
    setIsScreenSharing(true);
  }, [getPeer, isScreenSharing]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    localStream,
    remoteStream,
    cameraEnabled,
    micEnabled,
    isScreenSharing,
    mediaError,
    startLocalMedia,
    createOffer,
    handleRemoteOffer,
    handleRemoteAnswer,
    handleRemoteIce,
    restartIce,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    cleanup,
    setRemoteSocketId: (id: string) => {
      remoteSocketIdRef.current = id;
    },
  };
}
