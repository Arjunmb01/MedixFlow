import LocalVideo from "./LocalVideo";
import RemoteVideo from "./RemoteVideo";

interface Props {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export default function VideoGrid({ localStream, remoteStream }: Props) {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-950 rounded-3xl overflow-hidden">
      <RemoteVideo stream={remoteStream} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-4 right-4 w-48 h-36 shadow-2xl border-2 border-white/20 z-10">
        <LocalVideo stream={localStream} />
      </div>
    </div>
  );
}
