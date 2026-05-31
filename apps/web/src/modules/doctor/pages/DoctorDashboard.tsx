import { useState } from "react"
import { useNavigate } from "react-router-dom"
import DoctorSidebar from "../components/DoctorSidebar"
import DoctorTopNav from "../components/DoctorTopNav"
import { useDoctorDashboard } from "@/application/doctor/hooks/useDoctorDashboard"
import { startConsultation } from "@/infrastructure/api/consultation.api"
import { 
    CheckCircle2, 
    RefreshCcw, 
    ClipboardList, 
    Hourglass,
    ArrowRight,
    Video
} from "lucide-react"
import { canJoinVideoConsultation } from "@/application/consultation/utils/videoWindow"

export default function DoctorDashboard() {
    const { profile, stats, loading } = useDoctorDashboard()
    const navigate = useNavigate()
    const [isStartingSession, setIsStartingSession] = useState(false)

    const handleEnterWorkspace = async (consultationId?: string, consultationStatus?: string) => {
        if (!consultationId) return;

        if (consultationStatus === "IN_PROGRESS" || consultationStatus === "COMPLETED") {
            navigate(`/doctor/workspace/${consultationId}`);
            return;
        }

        try {
            setIsStartingSession(true);
            await startConsultation(consultationId);
            navigate(`/doctor/workspace/${consultationId}`);
        } catch (error) {
            console.error("Failed to start session", error);
        } finally {
            setIsStartingSession(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 flex-col items-center justify-center font-outfit">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold">Synchronizing clinical data...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50 font-outfit">
            <DoctorSidebar />
            
            <div className="flex-1 flex flex-col pl-64">
                <DoctorTopNav 
                    doctorName={`Dr. ${profile?.firstName} ${profile?.lastName}`} 
                    doctorSpecialty={profile?.specialty}
                    avatarUrl={profile?.avatarUrl}
                />

                <main className="p-8 space-y-8">
                    {/* Welcome Header */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Good morning, Dr. {profile?.firstName}</h1>
                        <p className="text-gray-500 font-medium">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="mx-2 text-teal-300">•</span>
                            Your clinic summary is ready.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <StatCard 
                            icon={Hourglass} 
                            label="Patients Waiting" 
                            value={stats?.pendingToday?.toString() || "0"} 
                            color="teal" 
                            pulse 
                        />
                        <StatCard 
                            icon={CheckCircle2} 
                            label="Completed Today" 
                            value={stats?.completedToday?.toString() || "0"} 
                            color="emerald" 
                        />
                        <StatCard 
                            icon={RefreshCcw} 
                            label="Follow-ups Due" 
                            value="05" 
                            color="cyan" 
                        />
                        <StatCard 
                            icon={ClipboardList} 
                            label="Total consultations" 
                            value={stats?.totalAppointments?.toString() || "0"} 
                            color="slate" 
                        />
                        <StatCard 
                            icon={Hourglass} 
                            label="Active Session" 
                            value="02:15:34" 
                            color="teal" 
                            timer 
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Current/Ongoing Session */}
                        <div className="lg:col-span-2 space-y-6">
                            {stats?.todayAppointments && stats.todayAppointments.length > 0 ? (() => {
                                const isCompleted = (a: any) => a.status === "COMPLETED" || a.consultationStatus === "COMPLETED";
                                const activeApt = stats.todayAppointments.find(a => a.consultationStatus === "IN_PROGRESS") || 
                                                 stats.todayAppointments.find(a => !isCompleted(a));
                                
                                if (!activeApt) return (
                                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 text-center">
                                        <p className="text-gray-400 font-bold">All sessions for today are completed</p>
                                    </div>
                                );

                                const isOngoing = activeApt.consultationStatus === "IN_PROGRESS";
                                return (
                                <div className={`bg-white rounded-[2.5rem] border ${isOngoing ? "border-green-400 ring-4 ring-green-50" : "border-teal-100"} p-8 shadow-xl shadow-teal-50 relative overflow-hidden group transition-all`}>
                                    <div className={`absolute top-0 right-0 py-2 px-8 ${isOngoing ? "bg-green-500" : "bg-teal-600"} text-white text-[10px] font-black uppercase tracking-widest rotate-45 translate-x-12 translate-y-4`}>
                                        {isOngoing ? "Active Session" : "Next Session"}
                                    </div>
                                    <div className="flex items-start gap-8">
                                        <div className={`w-20 h-20 ${isOngoing ? "bg-green-500" : "bg-teal-600"} rounded-3xl flex items-center justify-center text-white text-2xl font-black border-4 ${isOngoing ? "border-green-50" : "border-teal-50"} shadow-inner`}>
                                            {activeApt.patient.firstName[0]}{activeApt.patient.lastName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                                {activeApt.patient.firstName} {activeApt.patient.lastName}
                                            </h3>
                                            <p className="text-gray-400 font-bold text-sm mt-1">
                                                {activeApt.patient.gender} <span className="mx-1">•</span> ID: {activeApt.patient.patientId || activeApt.patient.id.slice(-6).toUpperCase()}
                                            </p>
                                            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full mt-4 text-[11px] font-black uppercase tracking-tight border border-teal-100">
                                                TIME: {activeApt.slotStart}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {canJoinVideoConsultation({
                                                consultationType: activeApt.consultationType,
                                                status: activeApt.status,
                                                appointmentDate: activeApt.appointmentDate,
                                                slotStart: activeApt.slotStart,
                                                slotEnd: activeApt.slotEnd ?? activeApt.slotStart,
                                            }) && (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/doctor/consultation/video/${activeApt.id}`)}
                                                    className="px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    Start Video Call
                                                </button>
                                            )}
                                            {activeApt.consultationType !== "VIDEO" && (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleEnterWorkspace(activeApt.consultationId, activeApt.consultationStatus)}
                                                    disabled={isStartingSession || !activeApt.isCheckedIn}
                                                    className={`px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
                                                        !activeApt.isCheckedIn 
                                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                                        : isOngoing
                                                            ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                                                            : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200"
                                                    }`}
                                                >
                                                    {isStartingSession ? (
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <>
                                                            {!activeApt.isCheckedIn ? "Not Checked In" : (isOngoing ? "Resume Workspace" : "Enter Workspace")}
                                                            {activeApt.isCheckedIn && <ArrowRight className="w-4 h-4" />}
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                );
                            })() : (
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 text-center">
                                    <p className="text-gray-400 font-bold">No sessions scheduled for today</p>
                                </div>
                            )}


                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Live Queue Monitor</h3>
                                    <button className="text-teal-600 font-black text-sm hover:underline flex items-center gap-2">
                                        View Full Queue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {stats?.todayAppointments?.map((apt, idx) => {
                                        const statusType = apt.status === 'COMPLETED' ? 'COMPLETED' : 
                                                          apt.consultationStatus === "IN_PROGRESS" ? "ONGOING" : 
                                                          apt.isCheckedIn ? "READY" : "WAITING";
                                        return (
                                            <QueueItem 
                                                key={apt.id}
                                                number={idx + 1} 
                                                name={`${apt.patient.firstName} ${apt.patient.lastName}`} 
                                                status={`${apt.consultationStatus ? apt.consultationStatus : apt.status} • Scheduled at ${apt.slotStart}`} 
                                                statusType={statusType}
                                                onClickAction={() => handleEnterWorkspace(apt.consultationId, apt.consultationStatus)}
                                                isDisabled={isStartingSession || (statusType === 'WAITING')}
                                            />
                                        );
                                    })}
                                    {(!stats?.todayAppointments || stats.todayAppointments.length === 0) && (
                                        <p className="text-gray-400 text-sm italic text-center py-4">Your queue is empty.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 px-2">Daily Timeline</h4>
                                <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-50">
                                    <TimelineItem active title="Consulting #09 (Arjun Sharma)" time="ONGOING" />
                                    <TimelineItem title="Follow-up (Robert Fox)" time="NEXT" />
                                </div>
                            </div>


                            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Follow-ups Due</h4>
                                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                                </div>
                                <div className="space-y-4">
                                    <PatientDashlet name="Robert Fox" reason="Diabetic Checkup • Today" />
                                    <PatientDashlet name="Jane Cooper" reason="BP Review • 3:00 PM" />
                                    <button className="w-full mt-4 bg-teal-50 text-teal-700 py-3.5 rounded-2xl font-black text-xs hover:bg-teal-100 transition-all uppercase tracking-widest">
                                        Manage Recalls
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color, pulse }: any) {
    const colors: any = {
        teal: "bg-teal-50 text-teal-600 border-teal-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
        slate: "bg-gray-50 text-gray-600 border-gray-100",
    }
    return (
        <div className={`p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-4 group transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-100/50 cursor-pointer ${pulse ? 'ring-2 ring-teal-500/5' : ''}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color] || colors.teal} transition-transform group-hover:scale-110`}>
                <Icon className={`w-6 h-6 ${pulse ? 'animate-pulse' : ''}`} />
            </div>
            <div>
                <p className="text-[22px] font-black text-gray-900 leading-none mb-1">{value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    )
}


function QueueItem({ number, name, status, statusType = "READY", onClickAction, isDisabled }: any) {
    const isOngoing = statusType === "ONGOING";
    const isReady = statusType === "READY";
    const isCompleted = statusType === "COMPLETED";
    
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between group hover:shadow-lg hover:shadow-gray-100/50 transition-all cursor-pointer">
            <div className="flex items-center gap-5">
                <div className={`w-10 h-10 ${isOngoing ? "bg-green-50 border-green-100 text-green-600" : isCompleted ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-gray-50 border-gray-100 text-gray-400"} rounded-xl flex items-center justify-center text-xs font-black border`}>
                    #{number}
                </div>
                <div>
                    <h4 className="text-sm font-black text-gray-900">{name}</h4>
                    <p className={`text-xs font-bold ${isOngoing ? 'text-green-600' : isCompleted ? 'text-blue-600' : isReady ? 'text-teal-600/60' : 'text-gray-400'}`}>{status}</p>
                </div>
            </div>
            <button 
                onClick={onClickAction}
                disabled={isDisabled}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isOngoing 
                ? 'bg-green-50 text-green-600 hover:bg-green-700 hover:text-white' 
                : isReady 
                    ? 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white' 
                    : isCompleted
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}>
               {isOngoing ? 'Resume' : isReady ? 'Call Next' : isCompleted ? 'Edit Prescription' : 'Waiting'}
            </button>
        </div>
    )
}

function TimelineItem({ title, time, active }: any) {
    return (
        <div className="pl-10 relative">
            <div className={`absolute left-[0.875rem] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all z-10 ${active ? 'bg-teal-500 ring-4 ring-teal-100 scale-125' : 'bg-gray-200'}`}></div>
            <div className={`space-y-1 ${active ? '' : 'opacity-40'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-teal-600' : 'text-gray-400'}`}>{time}</p>
                <h5 className="text-sm font-bold text-gray-900">{title}</h5>
            </div>
        </div>
    )
}

function PatientDashlet({ name, reason }: any) {
    return (
        <div className="group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 scale-0 group-hover:scale-100 transition-transform"></div>
                <div>
                    <h5 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{name}</h5>
                    <p className="text-xs text-gray-400 font-medium">{reason}</p>
                </div>
            </div>
        </div>
    )
}
