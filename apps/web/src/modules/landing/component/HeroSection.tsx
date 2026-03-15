import { Link } from "react-router-dom"


export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
      <div className="grid grid-cols-2 gap-12 items-center">

        {/* Left - Text */}
        <div>
          <h1 className="text-[46px] font-bold leading-[1.15] text-gray-900 tracking-tight">
            Book doctors<br />instantly, manage<br />health digitally.
          </h1>

          <p className="mt-5 text-[14px] text-gray-500 leading-relaxed max-w-sm">
            MedixFlow is the modern operating system for healthcare teams,
            bringing clinical excellence and administrative order under one
            unified platform.
          </p>

          <div className="flex items-center gap-4 mt-8">
            <Link
              to="/auth/register"
              className="bg-[#0066cc] hover:bg-blue-700 transition-colors text-white text-[14px] font-medium px-5 py-2.5 rounded-lg"
            >
              Start free trial
            </Link>
            <Link
              to="#how-it-works"
              className="text-[14px] text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-1"
            >
              See how it works
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>

        {/* Right - Dashboard mockup card */}
        <div className="relative">
          {/* Main card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="text-[11px] text-gray-400 font-medium">Patient Dashboard</div>
            </div>

            {/* Card content */}
            <div className="p-5">
              {/* Appointment widget */}
              <div className="bg-blue-50 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Next Appointment</span>
                  <span className="text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">Confirmed</span>
                </div>
                <div className="text-[13px] font-bold text-gray-900">Dr. Sarah Johnson</div>
                <div className="text-[12px] text-gray-500 mt-0.5">Cardiologist · Tomorrow, 10:30 AM</div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[11px] text-gray-400">Records</div>
                  <div className="text-[18px] font-bold text-gray-900 mt-0.5">24</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[11px] text-gray-400">Prescriptions</div>
                  <div className="text-[18px] font-bold text-gray-900 mt-0.5">7</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge top right */}
          <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3">
            <div className="text-[10px] text-gray-400 font-medium mb-0.5">Patient satisfaction</div>
            <div className="text-[20px] font-bold text-[#0066cc]">98.4%</div>
          </div>

          {/* Floating badge bottom left */}
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-800">Booking confirmed</div>
              <div className="text-[10px] text-gray-400">Just now</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}