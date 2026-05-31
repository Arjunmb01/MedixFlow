import DoctorSidebar from "../components/DoctorSidebar";
import DoctorTopNav from "../components/DoctorTopNav";
import { useDoctorAppointments } from "@/application/doctor/hooks/useDoctorAppointments";
import { useDoctorDashboard } from "@/application/doctor/hooks/useDoctorDashboard";
import { 
    Calendar, 
    Clock, 
    User, 
    Search, 
    Loader2,
    CalendarDays,
    X,
    CheckCircle2,
    AlertCircle,
    Eye,
    FileText,
    ChevronLeft,
    ChevronRight,
    Pill,
    CalendarClock,
    Video
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../../patient/components/ui/Badge";
import { RescheduleModal } from "@/modules/shared/components/RescheduleModal";
import type { Appointment } from "@/domain/appointment/types";
import { canJoinVideoConsultation } from "@/application/consultation/utils/videoWindow";

export default function DoctorAppointments() {
    const navigate = useNavigate();
    const { profile } = useDoctorDashboard();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("appointmentDate");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
    const [selectedPrescription, setSelectedPrescription] = useState<Appointment | null>(null);
    const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);

    const apiFilters = {
        status: (statusFilter === "ALL" || statusFilter === "UPCOMING") ? undefined : statusFilter,
        isUpcoming: statusFilter === "UPCOMING" ? true : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        limit: 4,
        sortBy,
        sortOrder
    };

    const { appointments: paginatedAppointments, loading, meta, refreshAppointments } = useDoctorAppointments(apiFilters);

    const getStatusVariant = (status: string): "success" | "warning" | "error" | "info" | "gray" => {
        switch (status.toUpperCase()) {
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            case 'PENDING': return 'warning';
            case 'CONFIRMED':
            case 'BOOKED': return 'info';
            case 'NO_SHOW': return 'gray';
            default: return 'info';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50 font-outfit">
            <DoctorSidebar />
            
            <div className="flex-1 flex flex-col pl-64">
                <DoctorTopNav 
                    doctorName={`Dr. ${profile?.firstName} ${profile?.lastName}`} 
                    doctorSpecialty={profile?.specialty}
                    avatarUrl={profile?.avatarUrl}
                />

                <main className="p-8 pb-12 max-w-7xl mx-auto w-full">
                    <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-[32px] font-black text-gray-900 tracking-tight">Patient Appointments</h1>
                            <p className="text-gray-500 font-medium mt-1">View and manage your scheduled consultations.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group">
                                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-teal-600 transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50 transition-all w-full md:w-[240px]"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input 
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="pl-4 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 focus:outline-none focus:border-teal-600 transition-all cursor-pointer"
                                        placeholder="From"
                                    />
                                    <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-gray-400 uppercase tracking-tighter">From</span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="pl-4 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 focus:outline-none focus:border-teal-600 transition-all cursor-pointer"
                                        placeholder="To"
                                    />
                                    <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black text-gray-400 uppercase tracking-tighter">To</span>
                                </div>
                                
                                {(statusFilter !== "ALL" || fromDate || toDate || searchTerm) && (
                                    <button 
                                        onClick={() => {setSearchTerm(""); setStatusFilter("ALL"); setFromDate(""); setToDate(""); setCurrentPage(1)}}
                                        className="p-3.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center gap-2 group border border-transparent hover:border-red-100"
                                        title="Clear all filters"
                                    >
                                        <X className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Clear All</span>
                                    </button>
                                )}

                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [newSortBy, newSortOrder] = e.target.value.split("-");
                                        setSortBy(newSortBy);
                                        setSortOrder(newSortOrder as "asc" | "desc");
                                        setCurrentPage(1);
                                    }}
                                    className="px-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 focus:outline-none focus:border-teal-600 transition-all cursor-pointer shadow-sm appearance-none pr-10 relative"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394A3B8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                                >
                                    <option value="appointmentDate-desc">Newest First</option>
                                    <option value="appointmentDate-asc">Oldest First</option>
                                    <option value="status-asc">Status (A-Z)</option>
                                    <option value="status-desc">Status (Z-A)</option>
                                </select>
                            </div>
                        </div>
                    </header>

                    {/* Filter Tabs */}
                    <div className="flex bg-gray-100/50 p-1.5 rounded-[2rem] border border-gray-200/50 mb-10 w-fit overflow-x-auto no-scrollbar">
                        {[
                            { id: 'UPCOMING', label: 'Upcoming' },
                            { id: 'COMPLETED', label: 'Completed' },
                            { id: 'CANCELLED', label: 'Cancelled' },
                            { id: 'NO_SHOW', label: 'Not Attended' },
                            { id: 'ALL', label: 'All Appointments' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
                                className={`px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    statusFilter === tab.id 
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                             <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
                             <p className="text-gray-500 font-bold">Synchronizing appointment ledger...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {!loading && paginatedAppointments.length > 0 ? (
                                paginatedAppointments.map((apt: any) => (
                                    <div 
                                        key={apt.id}
                                        className="bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-teal-600 hover:shadow-xl hover:shadow-teal-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center border border-gray-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
                                                <User className="w-8 h-8 text-gray-400 group-hover:text-teal-600 transition-colors" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-black text-gray-900">{apt.patient.firstName} {apt.patient.lastName}</h3>
                                                    <Badge variant={getStatusVariant(apt.status)}>{apt.status}</Badge>
                                                </div>
                                                <p className="text-gray-400 font-bold text-sm mt-1">Patient ID: {apt.patient.patientId || `PX-${apt.patient.id.split('-')[0].toUpperCase()}`}</p>
                                                
                                                <div className="flex items-center gap-6 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-teal-600" />
                                                        <span className="text-sm font-black text-gray-600">{formatDate(apt.appointmentDate as any)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-teal-600" />
                                                        <span className="text-sm font-black text-gray-600">{apt.slotStart} – {apt.slotEnd}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setSelectedApt(apt)}
                                                className="px-6 py-3 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl text-[13px] font-black uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" /> Details
                                            </button>
                                            
                                            {apt.status === 'COMPLETED' && (
                                                <button 
                                                    onClick={() => setSelectedPrescription(apt.consultation?.prescription)}
                                                    className="px-6 py-3 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl text-[13px] font-black uppercase tracking-wider hover:bg-teal-100 transition-all flex items-center gap-2"
                                                >
                                                    <FileText className="w-4 h-4" /> Prescriptions
                                                </button>
                                            )}

                                            {canJoinVideoConsultation(apt) && (
                                                <button
                                                    onClick={() => navigate(`/doctor/consultation/video/${apt.id}`)}
                                                    className="px-6 py-3 bg-violet-600 text-white rounded-xl text-[13px] font-black uppercase tracking-wider hover:bg-violet-700 transition-all shadow-lg shadow-violet-100 active:scale-95 flex items-center gap-2"
                                                >
                                                    <Video className="w-4 h-4" /> Start Video Call
                                                </button>
                                            )}

                                            {(apt.status === 'PENDING' || apt.status === 'BOOKED') && new Date(apt.appointmentDate) >= new Date(new Date().setHours(0,0,0,0)) && (
                                                <button
                                                    onClick={() => setRescheduleApt(apt)}
                                                    className="px-6 py-3 bg-teal-600 text-white rounded-xl text-[13px] font-black uppercase tracking-wider hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-95 flex items-center gap-2"
                                                >
                                                    <CalendarClock className="w-4 h-4" /> Reschedule
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                        <CalendarDays className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">No results found</h3>
                                    <p className="text-gray-400 font-medium max-w-xs text-center">We couldn't find any patient appointments matching your current criteria.</p>
                                    <button 
                                        onClick={() => {setSearchTerm(""); setStatusFilter("ALL"); setFromDate(""); setToDate(""); setCurrentPage(1)}}
                                        className="mt-8 text-teal-600 font-black text-sm uppercase tracking-widest hover:underline"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {meta && meta.totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="p-3 bg-white border border-gray-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-teal-600 transition-all text-gray-600"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    
                                    <div className="flex items-center gap-2 px-4">
                                        {[...Array(meta.totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                                                    currentPage === i + 1 
                                                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-100' 
                                                    : 'bg-white text-gray-500 border border-gray-100 hover:border-teal-600'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        disabled={currentPage === meta.totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))}
                                        className="p-3 bg-white border border-gray-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-teal-600 transition-all text-gray-600"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Appointment Detail Modal (Simplified for Doctor) */}
            {selectedApt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedApt(null)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 pb-0 flex justify-between items-start">
                            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <button onClick={() => setSelectedApt(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 pt-6">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-teal-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl border-4 border-teal-50 shadow-inner">
                                    {selectedApt.patient.firstName[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{selectedApt.patient.firstName} {selectedApt.patient.lastName}</h2>
                                    <p className="text-gray-400 font-bold">Patient • ID: {selectedApt.patient.patientId || 'NEW'}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                    <Badge variant={getStatusVariant(selectedApt.status)}>{selectedApt.status}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                                    <span className="text-sm font-black text-gray-700">{formatDate(selectedApt.appointmentDate as any)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Time</span>
                                    <span className="text-sm font-black text-gray-700">{selectedApt.slotStart} – {selectedApt.slotEnd}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Location</span>
                                    <span className="text-sm font-black text-gray-700">
                                        {selectedApt.consultationType === "VIDEO" ? "Video Consultation" : "In-Clinic Consultation"}
                                    </span>
                                </div>
                            </div>

                            {selectedApt.status === 'CANCELLED' && selectedApt.reason && (
                                <div className="mt-6 p-6 bg-red-50/50 border border-red-100 rounded-3xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">Cancellation Reason</span>
                                    </div>
                                    <p className="text-sm font-bold text-red-600 italic">"{selectedApt.reason}"</p>
                                </div>
                            )}

                            <div className="mt-10 flex gap-3">
                                {(selectedApt.status === 'PENDING' || selectedApt.status === 'BOOKED') && (
                                    <button
                                        onClick={() => { setRescheduleApt(selectedApt); setSelectedApt(null); }}
                                        className="flex-1 py-4 bg-teal-600 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 flex items-center justify-center gap-2"
                                    >
                                        <CalendarClock className="w-5 h-5" /> Reschedule
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSelectedApt(null)}
                                    className="flex-1 py-4 bg-white text-gray-600 border border-gray-200 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prescription Details Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setSelectedPrescription(null)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="bg-teal-600 px-8 py-6 text-white">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                        <Pill className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tighter leading-none">Prescription</h2>
                                        <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest mt-1">Medical Assessment & Dosage</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedPrescription(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Medicines List */}
                            <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                    Prescribed Medications
                                </p>
                                <div className="space-y-3">
                                    {selectedPrescription.medicines?.map((med: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 font-black border border-gray-100 shadow-sm">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 text-[15px]">{med.name}</h4>
                                                    <p className="text-xs font-bold text-gray-500">{med.dosage} • {med.frequency}</p>
                                                </div>
                                            </div>
                                            <div className="px-4 py-1.5 bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-teal-100">
                                                {med.duration}
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedPrescription.medicines || selectedPrescription.medicines.length === 0) && (
                                        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 font-bold">No medications recorded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Instructions */}
                            {selectedPrescription.instructions && (
                                <div className="p-6 bg-teal-50/50 rounded-3xl border border-teal-100">
                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Instructions & Notes</p>
                                    <p className="text-sm font-bold text-teal-900 leading-relaxed italic">
                                        "{selectedPrescription.instructions}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 pt-0 flex justify-end">
                            <button 
                                onClick={() => setSelectedPrescription(null)}
                                className="px-8 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                            >
                                Close Viewer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rescheduleApt && (
                <RescheduleModal
                    appointmentId={rescheduleApt.id}
                    patientId={rescheduleApt.patient?.id || rescheduleApt.patientId}
                    doctorId={rescheduleApt.doctorId ?? rescheduleApt.doctor?.id}
                    role="doctor"
                    onSuccess={refreshAppointments}
                    onClose={() => setRescheduleApt(null)}
                />
            )}
        </div>
    );
}
