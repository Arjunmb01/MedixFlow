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
              className="bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 hover:-translate-y-0.5 active:translate-y-0 text-white text-[15px] font-bold px-7 py-3 rounded-xl"
            >
              Start free trial
            </Link>
            <Link
              to="#how-it-works"
              className="text-[15px] text-gray-600 hover:text-primary-600 font-semibold transition-colors flex items-center gap-2 group"
            >
              See how it works
              <span className="text-gray-400 group-hover:text-primary-600 transition-colors">→</span>
            </Link>
          </div>
        </div>

        {/* Right - Dashboard mockup card */}
        <div className="relative">
          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">Patient Dashboard</div>
            </div>

            {/* Card content */}
            <div className="p-6">
              {/* Appointment widget */}
              <div className="bg-primary-50/50 border border-primary-100/50 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-bold text-primary-700 uppercase tracking-wider">Next Appointment</span>
                  <span className="text-[11px] bg-green-100 text-green-700 rounded-full px-3 py-1 font-bold">Confirmed</span>
                </div>
                <div className="text-[15px] font-bold text-gray-900">Dr. Sarah Johnson</div>
                <div className="text-[13px] text-gray-500 mt-1 font-medium">Cardiologist · Tomorrow, 10:30 AM</div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                  <div className="text-[12px] text-gray-400 font-bold">Records</div>
                  <div className="text-[20px] font-black text-gray-900 mt-1">24</div>
                </div>
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                  <div className="text-[12px] text-gray-400 font-bold">Prescriptions</div>
                  <div className="text-[20px] font-black text-gray-900 mt-1">7</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge top right */}
          <div className="absolute -top-6 -right-6 scale-110 bg-white rounded-2xl shadow-2xl border border-gray-50 px-5 py-4">
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Patient SAT</div>
            <div className="text-[24px] font-black text-primary-600 tracking-tight">98.4%</div>
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