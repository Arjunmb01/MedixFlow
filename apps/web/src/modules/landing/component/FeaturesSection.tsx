import doctorPatientImg from "@/assets/doctor_patient.png"
import operatingRoomImg from "@/assets/operating_room.png"
import surgeryTeamImg from "@/assets/surgery_team.png"

export default function FeaturesSection() {
  return (
    <>
      {/* ── Dark "One unified workspace" section ── */}
      {/* ── Dark "One unified workspace" section ── */}
      <section className="bg-[#050505] text-white mt-14 py-24 px-6 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-[120px] -z-10"></div>
        
        <h2 className="text-center text-[32px] font-black tracking-tight mb-16 leading-tight">
          One unified medical workspace.
        </h2>

        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
          <img
            src={doctorPatientImg}
            alt="Doctor consulting patient"
            loading="lazy"
            decoding="async"
            className="w-full h-[480px] object-cover rounded-[32px] shadow-2xl relative"
          />
          {/* Floating stat badge - top left */}
          <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] px-6 py-5 border border-white/20">
            <div className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Active patients</div>
            <div className="text-[28px] font-black text-gray-900 mt-1">12.4k</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[12px] text-primary-600 font-black">↑ 18.2%</span>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Growth</span>
            </div>
          </div>
          {/* Floating stat badge - bottom right */}
          <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] px-6 py-5 border border-white/20">
            <div className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Avg. wait time</div>
            <div className="text-[28px] font-black text-primary-600 mt-1">6 min</div>
            <div className="text-[11px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Optimized queue</div>
          </div>
        </div>
      </section>

      {/* ── Feature rows section ── */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-40">

          {/* Row 1 – Digital Prescription */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            {/* Text left */}
            <div className="order-2 md:order-1">
              <span className="inline-block text-[11px] font-black text-primary-600 bg-primary-50 px-4 py-2 rounded-xl mb-6 uppercase tracking-[0.2em]">
                For Patients
              </span>
              <h3 className="text-[36px] font-black text-gray-900 leading-[1.1] tracking-tight">
                Digital prescriptions<br />at your fingertips.
              </h3>
              <p className="mt-6 text-[16px] text-gray-400 leading-relaxed font-bold">
                Access your prescriptions anytime, anywhere. Securely shared with pharmacies, ensuring you never lose track of your medication history.
              </p>
              <div className="flex items-center gap-3 mt-8 text-[14px] text-primary-600 font-black uppercase tracking-widest">
                <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Secure digital ecosystem
              </div>
            </div>
            {/* Image right */}
            <div className="order-1 md:order-2 rounded-[32px] overflow-hidden shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img
                src={operatingRoomImg}
                alt="Operating room"
                loading="lazy"
                decoding="async"
                className="w-full h-[320px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Row 2 – Appointment booking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            {/* Image left */}
            <div className="rounded-[32px] overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img
                src={surgeryTeamImg}
                alt="Surgical team"
                loading="lazy"
                decoding="async"
                className="w-full h-[320px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Text right */}
            <div>
              <span className="inline-block text-[11px] font-black text-primary-600 bg-primary-50 px-4 py-2 rounded-xl mb-6 uppercase tracking-[0.2em]">
                For Doctors
              </span>
              <h3 className="text-[36px] font-black text-gray-900 leading-[1.1] tracking-tight">
                Smart scheduling,<br />zero friction.
              </h3>
              <p className="mt-6 text-[16px] text-gray-400 leading-relaxed font-bold">
                An intelligent scheduling system that flows with your workload. Patients book in real-time, giving you total control over your clinical queue.
              </p>
              <div className="flex items-center gap-3 mt-8 text-[14px] text-primary-600 font-black uppercase tracking-widest">
                <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Precision management
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}