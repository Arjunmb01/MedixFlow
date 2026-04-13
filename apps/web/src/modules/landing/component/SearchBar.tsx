export default function SearchBar() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-10 pb-6" id="search">
      {/* Search bar */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] px-6 py-5 flex items-center gap-4 max-w-2xl mx-auto group focus-within:ring-8 focus-within:ring-primary-50/50 transition-all">
        <svg className="w-5 h-5 text-gray-300 group-focus-within:text-primary-600 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search doctors, specialties, or conditions..."
          className="flex-1 text-[14px] text-gray-900 placeholder:text-gray-400 font-bold outline-none bg-transparent"
        />
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-6 w-px bg-gray-100" />
          <span className="text-[13px] text-gray-400 font-black uppercase tracking-widest">Near me</span>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 transition-all text-white text-[13px] font-black px-6 py-3 rounded-2xl shadow-lg shadow-primary-100">
          Find
        </button>
      </div>

      {/* Tag pills */}
      <div className="flex items-center justify-center gap-3 mt-8 text-[11px]">
        <span className="text-gray-400 font-black uppercase tracking-[0.2em]">Popular:</span>
        {["Cardiology", "Dermatology", "Pediatrics", "Neurology"].map((tag) => (
          <button
            key={tag}
            className="px-4 py-2 rounded-xl bg-white border-2 border-gray-50 text-gray-400 hover:border-primary-600/20 hover:text-primary-600 transition-all font-black uppercase tracking-widest shadow-sm"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  )
}