import { Loader2, Video } from "lucide-react";

interface Props {
  doctorJoined: boolean;
  patientAdmitted: boolean;
  title?: string;
}

export default function WaitingRoom({
  doctorJoined,
  patientAdmitted,
  title = "Waiting Room",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] bg-gradient-to-br from-primary-900 to-primary-700 rounded-3xl text-white p-10 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mb-6">
        <Video className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 text-white/70 max-w-md text-sm font-medium">
        {patientAdmitted
          ? "Connecting to your consultation..."
          : doctorJoined
            ? "Doctor is ready. You will be admitted shortly."
            : "Please wait. The doctor will start the consultation when ready."}
      </p>
      {!patientAdmitted && (
        <div className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-80">
          <Loader2 className="w-4 h-4 animate-spin" />
          {doctorJoined ? "Awaiting admission" : "Waiting for doctor"}
        </div>
      )}
    </div>
  );
}
