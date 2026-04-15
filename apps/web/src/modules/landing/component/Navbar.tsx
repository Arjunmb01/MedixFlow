import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <header className="flex justify-center pt-5 px-4 w-full">
      <div
        className="bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 rounded-full px-6 py-3 flex items-center gap-8 w-full max-w-5xl"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="MedixFlow Logo" className="h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          <span className="text-xl font-black text-gray-900 tracking-tight font-outfit">MedixFlow</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex gap-8 text-[14px] text-gray-500 font-medium flex-1">
          <a href="#about" className="hover:text-primary-600 transition-colors">About</a>
          <a href="#search" className="hover:text-primary-600 transition-colors">Search</a>
          <a href="#trust" className="hover:text-primary-600 transition-colors">Trust</a>
          <a href="#find" className="hover:text-primary-600 transition-colors">Find</a>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-4">
          <Link
            to="/patient/login"
            className="text-[14px] text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-1.5"
          >
            Login
          </Link>
          <Link
            to="/auth/register"
            className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all hover:-translate-y-0.5 active:translate-y-0 text-white text-[14px] font-bold px-6 py-2.5 rounded-full"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}