import { useEffect, useRef } from "react";

interface Props {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}

export default function LocalVideo({ stream, muted = true, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
    return () => {
      el.srcObject = null;
    };
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={`w-full h-full object-cover rounded-2xl bg-gray-900 ${className}`}
    />
  );
}
