import { MonitorUp } from "lucide-react";

interface Props {
  active: boolean;
  onClick: () => void;
}

export default function ScreenShareButton({ active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
        active ? "bg-primary-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"
      }`}
      aria-label="Share screen"
    >
      <MonitorUp className="w-5 h-5" />
    </button>
  );
}
