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
    
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSpecialty, setSelectedSpecialty] = useState("All")
    const [availableToday, setAvailableToday] = useState(false)
    const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 })
    const [currentPage, setCurrentPage] = useState(1)

    const { 
        doctors, 
        loading: doctorsLoading, 
        total: totalDoctors, 
        updateFilters 
    } = useFindDoctors({
        search: searchQuery,
        specialty: selectedSpecialty,
        availableToday,
        minFee: priceRange.min,
        maxFee: priceRange.max,
        page: currentPage,
        limit: 6
    })

    const specialties = ["All", ...SPECIALTY_OPTIONS]
    const limit = 6
    const totalPages = Math.ceil(totalDoctors / limit)

    // Debounced filter updates
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({
                search: searchQuery,
                specialty: selectedSpecialty,
                availableToday,
                minFee: priceRange.min,
                maxFee: priceRange.max,
                page: 1
            })
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery, selectedSpecialty, availableToday, priceRange])

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

                    {/* Horizontal Filter Bar */}
                    <div className="bg-white rounded-[2rem] p-4 border border-gray-100 shadow-sm mb-10 flex flex-wrap items-center gap-4 sticky top-24 z-20">
                        {/* Quick Search */}
                        <div className="flex-1 min-w-[240px] relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Doctor name, specialty..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <div className="h-8 w-px bg-gray-100 hidden md:block"></div>

                        {/* Specialization Dropdown */}
                        <div className="relative group">
                            <select 
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="bg-gray-50 border-none rounded-xl px-4 py-3 pr-10 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                            >
                                {specialties.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Availability Toggle */}
                        <button 
                            onClick={() => setAvailableToday(!availableToday)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                                availableToday ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-gray-50 border-transparent text-gray-500'
                            }`}
                        >
                            <Clock className={`w-4 h-4 ${availableToday ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className="text-sm font-bold">Available today</span>
                        </button>

                        <div className="h-8 w-px bg-gray-100 hidden md:block"></div>

                        {/* Fee Filter */}
                        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Fee</span>
                                <span className="text-xs font-black text-blue-600">₹{priceRange.max}</span>
                            </div>
                            <input 
                                type="range"
                                min="0"
                                max="2000"
                                step="100"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                className="w-24 md:w-32 accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Reset Button */}
                        <button 
                            onClick={() => {
                                setSearchQuery("")
                                setSelectedSpecialty("All")
                                setAvailableToday(false)
                                setPriceRange({ min: 0, max: 2000 })
                            }}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Reset filters"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Doctors Grid */}
                    <div className="w-full">
                        {doctorsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-50">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white h-[400px] rounded-[2.5rem] animate-pulse"></div>
                                ))}
                            </div>
                        ) : doctors.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {doctors.map((doctor: any) => (
                                    <div 
                                        key={doctor.id}
                                        className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group flex flex-col items-center text-center relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 group-hover:h-40 transition-all"></div>
                                        
                                        <div className="w-36 h-36 rounded-full bg-white border-4 border-white shadow-2xl flex items-center justify-center text-blue-600 mb-8 relative group-hover:scale-105 transition-transform overflow-hidden">
                                            {doctor.avatarUrl ? (
                                                <img src={doctor.avatarUrl} alt={doctor.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-16 h-16" />
                                            )}
                                            <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-8">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Dr. {doctor.firstName} {doctor.lastName}</h3>
                                            <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">{doctor.specialty} • Expert</p>
                                        </div>

                                        <div className="flex items-center gap-4 mb-10 w-full justify-center">
                                            <div className="bg-orange-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                                                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                                                <span className="text-xs font-black text-orange-600">{doctor.rating || '4.9'}</span>
                                            </div>
                                            <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                <span className="text-xs font-black text-blue-600">Available</span>
                                            </div>
                                        </div>

                                        <div className="w-full pt-8 border-t border-gray-50 flex items-center justify-between">
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fee</p>
                                                <span className="text-2xl font-black text-gray-900">₹{doctor.consultationFee}</span>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/patient/doctor/${doctor.id}`)}
                                                className="px-8 py-4 bg-gray-900 text-white rounded-[1.2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black active:scale-95 transition-all"
                                            >
                                                Book Now
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
