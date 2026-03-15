export default function SearchBar() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-10 pb-6" id="search">
      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-3 max-w-2xl mx-auto">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search doctors, specialties, or conditions..."
          className="flex-1 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
        />
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-[12px] text-gray-500 font-medium">Near me</span>
        </div>
        <button className="bg-[#0066cc] hover:bg-blue-700 transition-colors text-white text-[13px] font-medium px-4 py-2 rounded-xl">
          Find
        </button>
      </div>

      {/* Tag pills */}
      <div className="flex items-center justify-center gap-3 mt-5 text-[12px]">
        <span className="text-gray-400 font-medium">Popular:</span>
        {["Cardiology", "Dermatology", "Pediatrics", "Neurology"].map((tag) => (
          <button
            key={tag}
            className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors font-medium"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  )
}