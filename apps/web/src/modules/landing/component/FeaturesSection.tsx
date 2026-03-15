import doctorPatientImg from "@/assets/doctor_patient.png"
import operatingRoomImg from "@/assets/operating_room.png"
import surgeryTeamImg from "@/assets/surgery_team.png"

export default function FeaturesSection() {
  return (
    <>
      {/* ── Dark "One unified workspace" section ── */}
      <section className="bg-[#0d1b2e] text-white mt-14 py-16 px-6">
        <h2 className="text-center text-[24px] font-semibold tracking-tight mb-10">
          One unified medical workspace.
        </h2>

        <div className="max-w-5xl mx-auto relative">
          <img
            src={doctorPatientImg}
            alt="Doctor consulting patient"
            className="w-full h-[420px] object-cover rounded-2xl shadow-2xl"
          />
          {/* Floating stat badge - top left */}
          <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg px-4 py-3">
            <div className="text-[11px] text-gray-400 font-medium">Active patients</div>
            <div className="text-[22px] font-bold text-gray-900">12.4k</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] text-green-600 font-semibold">↑ 18.2%</span>
              <span className="text-[10px] text-gray-400">this month</span>
            </div>
          </div>
          {/* Floating stat badge - bottom right */}
          <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg px-4 py-3">
            <div className="text-[11px] text-gray-400 font-medium">Avg. wait time</div>
            <div className="text-[22px] font-bold text-[#0066cc]">6 min</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Down from 24 min</div>
          </div>
        </div>
      </section>

      {/* ── Feature rows section ── */}
      <section className="bg-[#f0f2f5] py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-24">

          {/* Row 1 – Digital Prescription */}
          <div className="grid grid-cols-2 gap-14 items-center">
            {/* Text left */}
            <div>
              <span className="inline-block text-[11px] font-semibold text-[#0066cc] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                For Patients
              </span>
              <h3 className="text-[28px] font-bold text-gray-900 leading-tight">
                Digital prescription<br />that travel with you
              </h3>
              <p className="mt-4 text-[14px] text-gray-500 leading-relaxed">
                Access your prescriptions anytime, anywhere. Share with any pharmacy
                and never lose track of your medication history again.
              </p>
              <div className="flex items-center gap-2 mt-5 text-[13px] text-[#0066cc] font-medium">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-[#0066cc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Fully digital and secure
              </div>
            </div>
            {/* Image right */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={operatingRoomImg}
                alt="Operating room"
                className="w-full h-[280px] object-cover"
              />
            </div>
          </div>

          {/* Row 2 – Appointment booking */}
          <div className="grid grid-cols-2 gap-14 items-center">
            {/* Image left */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={surgeryTeamImg}
                alt="Surgical team"
                className="w-full h-[280px] object-cover"
              />
            </div>
            {/* Text right */}
            <div>
              <span className="inline-block text-[11px] font-semibold text-[#0066cc] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                For Doctors
              </span>
              <h3 className="text-[28px] font-bold text-gray-900 leading-tight">
                Appointment<br />booking, simplified.
              </h3>
              <p className="mt-4 text-[14px] text-gray-500 leading-relaxed">
                Smart scheduling that fits your workflow. Patients book in seconds,
                you stay in control of your time with intelligent queue management.
              </p>
              <div className="flex items-center gap-2 mt-5 text-[13px] text-[#0066cc] font-medium">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-[#0066cc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                End-to-end scheduling
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}