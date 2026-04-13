export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-12 border-t border-gray-50">
      {/* ── Main Footer ── */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
        {/* Brand */}
        <div className="col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="MedixFlow Logo" className="h-9 w-auto object-contain" />
            <span className="text-xl font-black text-gray-900 tracking-tight font-outfit">MedixFlow</span>
          </div>
          <p className="text-[13px] text-gray-400 leading-relaxed font-bold">
            Redefining the standard of digital healthcare operations.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-black text-[11px] text-gray-900 mb-6 uppercase tracking-[0.2em]">Product</h4>
          <div className="flex flex-col gap-4 text-[13px] text-gray-500 font-bold">
            <a href="#" className="hover:text-primary-600 transition-colors inline-block w-max">For Patients</a>
            <a href="#" className="hover:text-primary-600 transition-colors inline-block w-max">For Doctors</a>
            <a href="#" className="hover:text-primary-600 transition-colors inline-block w-max">Security Protocol</a>
          </div>
        </div>

        <div>
          <h4 className="font-black text-[11px] text-gray-900 mb-6 uppercase tracking-[0.2em]">Company</h4>
          <div className="flex flex-col gap-4 text-[13px] text-gray-500 font-bold">
            <a href="#" className="hover:text-primary-600 transition-colors inline-block w-max">About MedixFlow</a>
            <a href="#" className="hover:text-primary-600 transition-colors inline-block w-max">System Status</a>
            <a href="#" className="hover:text-primary-600 transition-colors inline-block w-max">Legal & Privacy</a>
          </div>
        </div>

        <div>
          <h4 className="font-black text-[11px] text-gray-900 mb-6 uppercase tracking-[0.2em]">Connect</h4>
          <div className="flex flex-col gap-4 text-[13px] text-gray-500 font-bold">
            <a href="#" className="hover:text-primary-600 transition-colors inline-block w-max">Twitter</a>
            <a href="#" className="hover:text-primary-600 transition-colors inline-block w-max">LinkedIn</a>
            <a href="#" className="hover:text-primary-600 transition-colors inline-block w-max">Secure Email</a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-6 mt-20 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
          © 2026 MedixFlow Inc. Secure Healthcare Workspace.
        </p>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Global Network Active</span>
        </div>
      </div>
    </footer>
  )
}