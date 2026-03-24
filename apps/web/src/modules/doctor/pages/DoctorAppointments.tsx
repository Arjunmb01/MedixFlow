import DoctorSidebar from "../components/DoctorSidebar";
import DoctorTopNav from "../components/DoctorTopNav";
import { useDoctorAppointments } from "@/application/doctor/hooks/useDoctorAppointments";
import { useDoctorDashboard } from "@/application/doctor/hooks/useDoctorDashboard";
import { 
    Calendar, 
    Clock, 
    User, 
    Search, 
    Filter, 
    Loader2,
    CalendarDays,
    X,
    CheckCircle2,
    AlertCircle,
    Eye
} from "lucide-react";
import { useState, useMemo } from "react";
import Badge from "../../patient/components/ui/Badge";

export default function DoctorAppointments() {
    const { profile } = useDoctorDashboard();
    const { appointments, loading } = useDoctorAppointments();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedApt, setSelectedApt] = useState<any | null>(null);

    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const patientName = `${apt.patient.firstName} ${apt.patient.lastName}`.toLowerCase();
            const matchesSearch = patientName.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [appointments, searchTerm, statusFilter]);

    const getStatusVariant = (status: string): "success" | "warning" | "error" | "info" => {
        switch (status.toUpperCase()) {
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            case 'PENDING': return 'warning';
            case 'CONFIRMED': return 'info';
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

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-teal-600 transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50 transition-all w-full md:w-[280px]"
                                />
                            </div>
                            
                            <div className="relative group">
                                <Filter className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-teal-600 transition-colors" />
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 focus:outline-none focus:border-teal-600 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                             <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
                             <p className="text-gray-500 font-bold">Synchronizing appointment ledger...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((apt) => (
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
                                                <p className="text-gray-400 font-bold text-sm mt-1">Patient ID: #PX-{apt.patient.patientId || apt.patient.id.split('-')[0].toUpperCase()}</p>
                                                
                                                <div className="flex items-center gap-6 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-teal-600" />
                                                        <span className="text-sm font-black text-gray-600">{formatDate(apt.appointmentDate)}</span>
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
                                            <button className="px-6 py-3 bg-teal-600 text-white rounded-xl text-[13px] font-black uppercase tracking-wider hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-95">
                                                Reschedule
                                            </button>
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
                                        onClick={() => {setSearchTerm(""); setStatusFilter("ALL")}}
                                        className="mt-8 text-teal-600 font-black text-sm uppercase tracking-widest hover:underline"
                                    >
                                        Clear Search
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
                                    <p className="text-gray-400 font-bold">Patient • ID: #PX-{selectedApt.patient.patientId || 'NEW'}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                    <Badge variant={getStatusVariant(selectedApt.status)}>{selectedApt.status}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                                    <span className="text-sm font-black text-gray-700">{formatDate(selectedApt.appointmentDate)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Time</span>
                                    <span className="text-sm font-black text-gray-700">{selectedApt.slotStart} – {selectedApt.slotEnd}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Location</span>
                                    <span className="text-sm font-black text-gray-700">In-Clinic Consultation</span>
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
                                <button className="flex-1 py-4 bg-teal-600 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-100">
                                    Reschedule
                                </button>
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
        </div>
    );
}
