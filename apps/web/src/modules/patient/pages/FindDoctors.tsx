import { useState, useEffect } from "react"
import Sidebar from "../components/dashboard/Sidebar"
import TopNav from "../components/dashboard/TopNav"
import { Search, Star, Clock, User, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { SPECIALTY_OPTIONS } from "../../admin/types/specialty"
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile"
import { useFindDoctors } from "@/application/doctor/hooks/useFindDoctors"

export default function FindDoctors() {
    const navigate = useNavigate()
    const { profile, loading: profileLoading } = usePatientProfile()
    
    const [experience, setExperience] = useState(0)
    const [minRating, setMinRating] = useState(0)
    const [sortBy, setSortBy] = useState("rating_desc")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSpecialty, setSelectedSpecialty] = useState("All")
    const [availableToday, setAvailableToday] = useState(false)
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
    const [currentPage, setCurrentPage] = useState(1)

    const { 
        doctors = [], 
        loading: doctorsLoading, 
        total: totalDoctors, 
        updateFilters 
    } = useFindDoctors({
        search: searchQuery,
        specialty: selectedSpecialty,
        availableToday,
        minFee: priceRange.min,
        maxFee: priceRange.max,
        experienceYears: experience,
        minRating: minRating,
        sortBy: sortBy,
        page: currentPage,
        limit: 9
    })

    const specialties = ["SPECIALTY", ...SPECIALTY_OPTIONS]
    const limit = 9
    const totalPages = Math.ceil(totalDoctors / limit)

    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({
                search: searchQuery,
                specialty: selectedSpecialty,
                availableToday,
                minFee: priceRange.min,
                maxFee: priceRange.max,
                experienceYears: experience,
                minRating: minRating,
                sortBy: sortBy,
                page: 1
            })
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery, selectedSpecialty, availableToday, priceRange, experience, minRating, sortBy])

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        updateFilters({ page: newPage })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (!profile && profileLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 flex-col font-outfit">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-outfit">
            <Sidebar />

            <div className="flex-1 ml-64">
                <TopNav 
                    userName={`${profile?.name}`} 
                    patientId={profile?.patientId || "PX-202"} 
                />

                <main className="pt-28 pb-12 px-8">
                    {/* Header Section */}
                    <div className="flex flex-col gap-2 mb-8">
                        <h1 className="text-[32px] font-black text-gray-900 tracking-tight">Find Your Specialist</h1>
                        <p className="text-gray-500 font-medium">Book appointments with top-rated doctors in your city.</p>
                    </div>

                    {/* Advanced Filter Bar */}
                    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl shadow-blue-900/5 mb-10 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Quick Search */}
                            <div className="flex-1 min-w-[280px] relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Doctor name, hospital, keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                                />
                            </div>

                            <div className="h-10 w-px bg-gray-100 hidden lg:block"></div>

                            {/* Sort Dropdown */}
                            <div className="relative group">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-blue-50 border-none rounded-2xl px-5 py-4 pr-12 text-sm font-black text-blue-700 focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="rating_desc">Top Rated</option>
                                    <option value="fee_asc">Price: Low to High</option>
                                    <option value="fee_desc">Price: High to Low</option>
                                    <option value="experience_desc">Experience</option>
                                    <option value="name_asc">Name (A-Z)</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none rotate-90" />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            {/* Specialization */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Specialization</label>
                                <div className="relative">
                                    <select 
                                        value={selectedSpecialty}
                                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer min-w-[160px]"
                                    >
                                        {specialties.map(spec => (
                                            <option key={spec} value={spec}>{spec}</option>
                                        ))}
                                    </select>
                                    <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                                </div>
                            </div>

                            {/* Experience Filter */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Experience</label>
                                <select 
                                    value={experience}
                                    onChange={(e) => setExperience(Number(e.target.value))}
                                    className="bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                                >
                                    <option value={0}>Any Experience</option>
                                    <option value={5}>5+ Years</option>
                                    <option value={10}>10+ Years</option>
                                    <option value={15}>15+ Years</option>
                                </select>
                            </div>

                            {/* Rating Filter */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Min Rating</label>
                                <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star}
                                            onClick={() => setMinRating(minRating === star ? 0 : star)}
                                            className={`p-1 rounded-md transition-all ${minRating >= star ? 'text-orange-400' : 'text-gray-200'}`}
                                        >
                                            <Star className={`w-4 h-4 ${minRating >= star ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fee Slider */}
                            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultation Fee</label>
                                    <span className="text-[10px] font-black text-blue-600">Up to ₹{priceRange.max}</span>
                                </div>
                                <input 
                                    type="range"
                                    min="0"
                                    max="5000"
                                    step="500"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                    className="w-full accent-blue-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Quick Availability */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Availability</label>
                                <button 
                                    onClick={() => setAvailableToday(!availableToday)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                                        availableToday ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-gray-50 border-transparent text-gray-500'
                                    }`}
                                >
                                    <Clock className={`w-3.5 h-3.5 ${availableToday ? 'text-green-500' : 'text-gray-400'}`} />
                                    <span className="text-xs font-bold whitespace-nowrap">Available today</span>
                                </button>
                            </div>

                            {/* Reset Button */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] opacity-0 uppercase tracking-widest px-1">Reset</label>
                                <button 
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSelectedSpecialty("All")
                                        setAvailableToday(false)
                                        setPriceRange({ min: 0, max: 2000 })
                                        setExperience(0)
                                        setMinRating(0)
                                        setSortBy("rating_desc")
                                    }}
                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                    title="Reset all filters"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Doctors Grid */}
                    <div className="w-full">
                        {doctorsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                    <div key={i} className="bg-white h-[320px] rounded-[2rem] animate-pulse"></div>
                                ))}
                            </div>
                        ) : doctors?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {doctors.map((doctor: any) => (
                                    <div 
                                        key={doctor.id}
                                        className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group flex flex-col items-center text-center relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 group-hover:h-32 transition-all"></div>
                                        
                                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-2xl flex items-center justify-center text-blue-600 mb-5 relative group-hover:scale-105 transition-transform overflow-hidden">
                                            {doctor.avatarUrl ? (
                                                <img src={doctor.avatarUrl} alt={doctor.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-10 h-10" />
                                            )}
                                            <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 border-[3px] border-white rounded-full flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 mb-5">
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Dr. {doctor.firstName} {doctor.lastName}</h3>
                                            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{doctor.specialty} • Expert</p>
                                        </div>

                                        <div className="flex items-center gap-3 mb-6 w-full justify-center">
                                            <div className="bg-orange-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                                <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                                <span className="text-xs font-black text-orange-600">{doctor.rating || '4.9'}</span>
                                            </div>
                                            <div className="bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="text-xs font-black text-blue-600">Available</span>
                                            </div>
                                        </div>

                                        <div className="w-full pt-5 border-t border-gray-50 flex items-center justify-between">
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fee</p>
                                                <span className="text-xl font-black text-gray-900">₹{doctor.consultationFee}</span>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/find-doctors/${doctor.id}`)}
                                                className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black active:scale-95 transition-all"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>

                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] p-24 border border-dashed border-gray-200 text-center space-y-8">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">No specialists found</h3>
                                    <p className="text-gray-400 font-medium max-w-sm mx-auto">Try adjusting your filters or searching for something else.</p>
                                </div>
                                <button 
                                    onClick={() => {setSearchQuery(""); setSelectedSpecialty("All")}}
                                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all"
                                >
                                    View All Doctors
                                </button>
                            </div>
                        )}

                        {/* Pagination UI */}
                        {totalDoctors > limit && (
                            <div className="mt-16 flex items-center justify-center gap-8">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                
                                <div className="flex items-center gap-3">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                                                currentPage === i + 1 
                                                ? "bg-blue-600 text-white shadow-xl shadow-blue-100 scale-110" 
                                                : "bg-white text-gray-400 border border-gray-100 hover:border-blue-100 hover:text-gray-600 shadow-sm"
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
