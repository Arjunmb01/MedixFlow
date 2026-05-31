import { useEffect, useRef } from "react";

interface Props {
  stream: MediaStream | null;
  className?: string;
}

export default function RemoteVideo({ stream, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
    return () => {
      el.srcObject = null;
    };
  }, [stream]);

  if (!stream) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 text-gray-400 rounded-2xl ${className}`}
      >
        Waiting for participant...
      </div>
    );
  }

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className={`w-full h-full object-cover rounded-2xl bg-gray-900 ${className}`}
    />
  );
}
