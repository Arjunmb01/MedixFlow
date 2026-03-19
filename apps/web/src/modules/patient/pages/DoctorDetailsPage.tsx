import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import Sidebar from "../components/dashboard/Sidebar"
import TopNav from "../components/dashboard/TopNav"
import { getPatientProfile } from "../services/patient.api"
import { getDoctorDetails } from "../services/doctor.api"
import { 
    Star, 
    Clock, 
    ShieldCheck, 
    MessageSquare, 
    Share2, 
    Heart,
    Award,
    ChevronLeft,
    CheckCircle2,
    CalendarDays
} from "lucide-react"

export default function DoctorDetailsPage() {
    const { id } = useParams()
    const [profile, setProfile] = useState<any>(null)
    const [doctor, setDoctor] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("About")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, doctorData] = await Promise.all([
                    getPatientProfile(),
                    getDoctorDetails(id || "")
                ])
                setProfile(profileData)
                setDoctor(doctorData)
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) {
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

                <main className="pt-28 pb-12 px-8 max-w-6xl mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-8 px-2">
                        <Link to="/patient/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                        <ChevronLeft className="w-3 h-3 rotate-180" />
                        <Link to="/patient/find-doctors" className="hover:text-blue-600 transition-colors">Find Doctors</Link>
                        <ChevronLeft className="w-3 h-3 rotate-180" />
                        <span className="text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</span>
                    </nav>

                    {/* Profile Header Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-10 overflow-hidden relative">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-20 -mt-20 blur-3xl -z-10"></div>
                        
                        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                            <div className="relative">
                                <div className="w-44 h-44 rounded-[3rem] bg-gray-50 flex items-center justify-center text-blue-600 border-4 border-white shadow-2xl relative">
                                    {doctor.avatarUrl ? (
                                        <img src={doctor.avatarUrl} alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} className="w-full h-full object-cover rounded-[2.5rem]" />
                                    ) : (
                                        <ShieldCheck className="w-20 h-20" />
                                    )}
                                    <div className="absolute -bottom-2 -inset-x-2">
                                        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-200">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Verified Specialist
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h1 className="text-[34px] font-black text-gray-900 tracking-tight">Dr. {doctor.firstName} {doctor.lastName}</h1>
                                            <p className="text-blue-600 font-bold text-sm uppercase tracking-[0.2em] mt-1">{doctor.specialty}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-3 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-2xl transition-all active:scale-95 group">
                                                <Share2 className="w-5 h-5 group-hover:text-blue-600" />
                                            </button>
                                            <button className="p-3 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-2xl transition-all active:scale-95 group">
                                                <Heart className="w-5 h-5 group-hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                            <span className="text-lg font-black text-gray-900">4.9</span>
                                            <span className="text-[10px] font-bold text-gray-400">Reviews</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">License</p>
                                        <span className="text-sm font-black text-gray-900">{doctor.licenseNumber}</span>
                                    </div>
                                    <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fee</p>
                                        <span className="text-lg font-black text-gray-900">₹{doctor.consultationFee}</span>
                                    </div>
                                    <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className="text-sm font-black text-blue-600">Active</span>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">Available Today</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 text-gray-500 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all group">
                                            <MessageSquare className="w-4 h-4 group-hover:text-blue-600" />
                                            Chat with {doctor.firstName}
                                        </button>
                                        <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                                            Book Appointment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Content Tabs */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                        <div className="flex items-center border-b border-gray-50 px-8">
                            {["About", "Reviews", "Schedule"].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
                                        activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-gray-900"
                                    }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 inset-x-8 h-1 bg-blue-600 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-10">
                            {activeTab === "About" && (
                                <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Professional Bio</h3>
                                    <p className="text-gray-500 font-medium leading-[1.8] text-base">
                                        {doctor.bio || "No professional bio provided yet."}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Specializations</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 shadow-sm transition-colors">
                                                <Award className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-black text-gray-900">{doctor.specialty}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                            {activeTab === "Schedule" && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Weekly Availability</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unavailable</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-4">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => {
                                            const schedule = doctor.schedules?.find((s: any) => s.dayOfWeek === idx)
                                            return (
                                                <div key={day} className={`p-6 rounded-[2rem] border transition-all text-center space-y-4 ${
                                                    schedule ? 'bg-blue-50/30 border-blue-100 shadow-sm' : 'bg-gray-50/50 border-gray-100 grayscale'
                                                }`}>
                                                    <span className={`text-[11px] font-black uppercase tracking-widest ${schedule ? 'text-blue-600' : 'text-gray-400'}`}>{day}</span>
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 mx-auto shadow-sm">
                                                        <CalendarDays className={`w-6 h-6 ${schedule ? 'text-blue-500' : 'text-gray-200'}`} />
                                                    </div>
                                                    {schedule ? (
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-gray-900">{schedule.startTime}</p>
                                                            <p className="text-[10px] font-bold text-gray-400">TO</p>
                                                            <p className="text-[10px] font-black text-gray-900">{schedule.endTime}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Closed</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    
                                    <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 flex gap-4 mt-8">
                                        <Clock className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-orange-900 tracking-tight">Important Note</h4>
                                            <p className="text-xs font-medium text-orange-700/70 leading-relaxed">Please arrive 15 minutes before your scheduled appointment time for registration and vitals check.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "Reviews" && (
                                <div className="text-center py-20 animate-in fade-in duration-500">
                                    <Star className="w-16 h-16 text-gray-100 mx-auto fill-gray-50 mb-6" />
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Patient Reviews</h3>
                                    <p className="text-gray-400 font-medium text-sm mt-2 max-w-xs mx-auto">Patient reviews are currently being imported and will be visible shortly.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
