export default function Footer() {
  return (
    <footer className="bg-[#f0f2f5] pt-10 pb-6">
      {/* ── Trusted By Section ── */}
      <div className="bg-[#f5faff] py-12 px-6 border-y border-blue-50/50 mb-16">
        <h3 className="text-center text-[10px] uppercase tracking-widest font-bold text-[#0066cc] mb-8">
          TRUSTED BY OVER 5,000+ HEALTHCARE PROVIDERS
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          <div className="text-[18px] font-bold text-gray-800 tracking-tight flex items-center gap-1">
            <span className="text-blue-600">Health</span>Pro
          </div>
          <div className="text-[18px] font-bold text-gray-800 tracking-tight flex items-center gap-1">
            <span className="text-blue-600">Clinic</span>Cloud
          </div>
          <div className="text-[18px] font-bold text-gray-800 tracking-tight flex items-center gap-1">
            Med<span className="text-blue-600">Global</span>
          </div>
          <div className="text-[18px] font-bold text-gray-800 tracking-tight flex items-center gap-1">
            Bio<span className="text-blue-600">Core</span>
          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-4 gap-12">
        {/* Brand */}
        <div className="col-span-1 border-gray-200">
          <div className="font-bold text-[16px] text-[#0066cc] tracking-tight flex items-center gap-1.5 mb-2">
            MedixFlow
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed max-w-[160px]">
            Comprehensive medical management for modern teams and patients.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-[11px] text-gray-900 mb-4 tracking-wide">Product</h4>
          <div className="flex flex-col gap-3 text-[11px] text-gray-500">
            <a href="#" className="hover:text-[#0066cc] transition-colors inline-block w-max">For Patients</a>
            <a href="#" className="hover:text-[#0066cc] transition-colors inline-block w-max">For Doctors</a>
            <a href="#" className="hover:text-[#0066cc] transition-colors inline-block w-max">Pricing Plans</a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-[11px] text-gray-900 mb-4 tracking-wide">Company</h4>
          <div className="flex flex-col gap-3 text-[11px] text-gray-500">
            <a href="#" className="hover:text-[#0066cc] transition-colors inline-block w-max">About Us</a>
            <a href="#" className="hover:text-[#0066cc] transition-colors inline-block w-max">Our Strategy</a>
            <a href="#" className="hover:text-[#0066cc] transition-colors inline-block w-max">Security</a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-[11px] text-gray-900 mb-4 tracking-wide">Social</h4>
          <div className="flex flex-col gap-3 text-[11px] text-gray-500">
            <a href="#" className="hover:text-[#0066cc] transition-colors inline-block w-max">Twitter</a>
            <a href="#" className="hover:text-[#0066cc] transition-colors inline-block w-max">LinkedIn</a>
            <a href="#" className="hover:text-[#0066cc] transition-colors inline-block w-max">Instagram</a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-5xl mx-auto px-6 mt-16 pt-6 border-t border-gray-200 text-center">
        <p className="text-[10px] text-gray-400">
          © 2026 MedixFlow Inc. All rights reserved.
        </p>
      </div>
    </footer>
  )
}