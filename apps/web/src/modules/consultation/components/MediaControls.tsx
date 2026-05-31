import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import ScreenShareButton from "./ScreenShareButton";

interface Props {
  cameraEnabled: boolean;
  micEnabled: boolean;
  isScreenSharing: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleScreen: () => void;
  onEndCall: () => void;
  endLabel?: string;
}

export default function MediaControls({
  cameraEnabled,
  micEnabled,
  isScreenSharing,
  onToggleCamera,
  onToggleMic,
  onToggleScreen,
  onEndCall,
  endLabel = "End Call",
}: Props) {
  const btn =
    "w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white/10 hover:bg-white/20 text-white";

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button type="button" onClick={onToggleMic} className={btn} aria-label="Toggle microphone">
        {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-400" />}
      </button>
      <button type="button" onClick={onToggleCamera} className={btn} aria-label="Toggle camera">
        {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-red-400" />}
      </button>
      <ScreenShareButton active={isScreenSharing} onClick={onToggleScreen} />
      <button
        type="button"
        onClick={onEndCall}
        className="h-12 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2"
      >
        <PhoneOff className="w-5 h-5" />
        {endLabel}
      </button>
    </div>
  );
}
