import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <header className="flex justify-center pt-5 px-4 w-full">
      <div
        className="bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 rounded-full px-5 py-2.5 flex items-center gap-8 w-full max-w-4xl"
      >
        {/* Logo */}
        <span className="font-bold text-[15px] text-[#0066cc] tracking-tight mr-2">
          MedixFlow
        </span>

        {/* Nav links */}
        <nav className="flex gap-6 text-[13px] text-gray-600 font-medium flex-1">
          <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
          <a href="#search" className="hover:text-gray-900 transition-colors">Search</a>
          <a href="#trust" className="hover:text-gray-900 transition-colors">Trust</a>
          <a href="#find" className="hover:text-gray-900 transition-colors">Find</a>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <Link
            to="/patient/login"
            className="text-[13px] text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-1.5"
          >
            Login
          </Link>
          <Link
            to="/auth/register"
            className="bg-[#0066cc] hover:bg-blue-700 transition-colors text-white text-[13px] font-medium px-4 py-2 rounded-full"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}