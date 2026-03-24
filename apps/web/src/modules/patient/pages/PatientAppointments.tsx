import Sidebar from "../components/dashboard/Sidebar";
import TopNav from "../components/dashboard/TopNav";
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile";
import { useState, useEffect, useMemo } from "react";
import { 
    Calendar, 
    Clock, 
    User, 
    Search, 
    Filter, 
    Loader2,
    CalendarDays,
    X,
    AlertCircle,
    MapPin,
    FileText
} from "lucide-react";
import { getPatientAppointments, cancelAppointment } from "@/infrastructure/api/patient.api";
import Badge from "../components/ui/Badge";
import { toast } from "sonner";

export default function PatientAppointments() {
    const { profile } = usePatientProfile();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    
    // Modal states
    const [selectedApt, setSelectedApt] = useState<any | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await getPatientAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelReason.trim()) {
            toast.error("Please provide a reason for cancellation");
            return;
        }

        try {
            setIsCancelling(true);
            await cancelAppointment(selectedApt.id, cancelReason);
            toast.success("Appointment cancelled successfully");
            setShowCancelModal(false);
            setSelectedApt(null);
            setCancelReason("");
            fetchAppointments(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel appointment");
        } finally {
            setIsCancelling(false);
        }
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const drName = `${apt.doctor.firstName} ${apt.doctor.lastName}`.toLowerCase();
            const matchesSearch = drName.includes(searchTerm.toLowerCase());
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
        <div className="min-h-screen bg-[#F8FAFC] flex font-outfit">
            <Sidebar />

            <div className="flex-1 ml-64">
                <TopNav 
                    userName={`${profile?.name}`} 
                    patientId={profile?.patientId || "PX-202"} 
                />

                <main className="pt-28 pb-12 px-8 max-w-7xl mx-auto">
                    <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-[32px] font-black text-[#0F172A] tracking-tight">My Appointments</h1>
                            <p className="text-[#64748B] font-medium mt-1">Manage and track all your medical consultations.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="w-5 h-5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#3B82F6] transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search by doctor name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-medium focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-50 transition-all w-full md:w-[280px]"
                                />
                            </div>
                            
                            <div className="relative group">
                                <Filter className="w-5 h-5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#3B82F6] transition-colors" />
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-12 pr-10 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all appearance-none cursor-pointer"
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
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-[#E2E8F0]">
                             <Loader2 className="w-12 h-12 text-[#3B82F6] animate-spin mb-4" />
                             <p className="text-[#64748B] font-bold">Synchronizing your appointments...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((apt) => (
                                    <div 
                                        key={apt.id}
                                        className="bg-white p-6 rounded-[2rem] border border-[#E2E8F0] hover:border-[#3B82F6] hover:shadow-xl hover:shadow-blue-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-[#F8FAFC] rounded-[1.5rem] flex items-center justify-center border border-[#F1F5F9] group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                                <User className="w-8 h-8 text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-black text-[#0F172A]">Dr. {apt.doctor.firstName} {apt.doctor.lastName}</h3>
                                                    <Badge variant={getStatusVariant(apt.status)}>{apt.status}</Badge>
                                                </div>
                                                <p className="text-[#64748B] font-bold text-sm mt-1">{apt.doctor.specialization.name} • Specialist</p>
                                                
                                                <div className="flex items-center gap-6 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-[#3B82F6]" />
                                                        <span className="text-sm font-black text-[#475569]">{formatDate(apt.appointmentDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-[#3B82F6]" />
                                                        <span className="text-sm font-black text-[#475569]">{apt.slotStart} – {apt.slotEnd}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 md:flex-col md:items-end">
                                            <button 
                                                onClick={() => setSelectedApt(apt)}
                                                className="flex-1 md:flex-none px-6 py-3 bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] rounded-xl text-[13px] font-black uppercase tracking-wider hover:bg-[#F1F5F9] transition-all"
                                            >
                                                View Details
                                            </button>
                                            <button className="flex-1 md:flex-none px-6 py-3 bg-white text-[#3B82F6] border border-[#3B82F6] rounded-xl text-[13px] font-black uppercase tracking-wider hover:bg-blue-50 transition-all">
                                                Download Invoice
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-[#E2E8F0]">
                                    <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-6">
                                        <CalendarDays className="w-10 h-10 text-[#CBD5E1]" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#0F172A] mb-2">No appointments found</h3>
                                    <p className="text-[#64748B] font-medium max-w-xs text-center">We couldn't find any appointments matching your filters or search criteria.</p>
                                    <button 
                                        onClick={() => {setSearchTerm(""); setStatusFilter("ALL")}}
                                        className="mt-8 text-[#3B82F6] font-black text-sm uppercase tracking-widest hover:underline"
                                    >
                                        Reset all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Appointment Details Modal */}
            {selectedApt && !showCancelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setSelectedApt(null)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 pb-0 flex justify-between items-start">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <button onClick={() => setSelectedApt(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 pt-6">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center border border-gray-100 font-black text-xl text-gray-400">
                                    {selectedApt.doctor.firstName[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#0F172A]">Dr. {selectedApt.doctor.firstName} {selectedApt.doctor.lastName}</h2>
                                    <p className="text-[#64748B] font-bold">{selectedApt.doctor.specialization.name} • Specialist</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                                    <div>
                                        <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Status</p>
                                        <Badge variant={getStatusVariant(selectedApt.status)}>{selectedApt.status}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Appointment ID</p>
                                        <p className="text-sm font-black text-[#475569]">#APT-{selectedApt.id.split('-')[0].toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-[#F8FAFC] rounded-3xl border border-[#F1F5F9] space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Date</p>
                                            <p className="text-sm font-black text-[#475569]">{formatDate(selectedApt.appointmentDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Time Slot</p>
                                            <p className="text-sm font-black text-[#475569]">{selectedApt.slotStart} – {selectedApt.slotEnd}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Location</p>
                                            <p className="text-sm font-black text-[#475569]">In-Clinic Consultation</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedApt.reason && (
                                    <div className="p-6 bg-red-50/30 border border-red-100 rounded-3xl">
                                        <p className="text-[11px] font-black text-red-400 uppercase tracking-widest mb-2">Cancellation Reason</p>
                                        <p className="text-sm font-bold text-red-600 leading-relaxed italic">"{selectedApt.reason}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 flex gap-3">
                                {selectedApt.status !== 'CANCELLED' && selectedApt.status !== 'COMPLETED' && (
                                    <button 
                                        onClick={() => setShowCancelModal(true)}
                                        className="flex-1 py-4 bg-white text-red-600 border-2 border-red-600 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                    >
                                        Cancel Appointment
                                    </button>
                                )}
                                <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all shadow-md">
                                    Reschedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
                        <div className="p-8">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            
                            <h2 className="text-2xl font-black text-[#0F172A] mb-2">Cancel Appointment?</h2>
                            <p className="text-[#64748B] font-medium mb-8">Are you sure you want to cancel this session? Please tell us why so we can help you better.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest ml-1 mb-2 block">Cancellation Reason</label>
                                    <textarea 
                                        rows={4}
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="e.g. Schedule conflict, feeling better, etc."
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:border-red-300 focus:ring-4 focus:ring-red-50 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <button 
                                    onClick={handleCancel}
                                    disabled={isCancelling}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Cancellation'}
                                </button>
                                <button 
                                    onClick={() => setShowCancelModal(false)}
                                    className="w-full py-4 bg-white text-[#64748B] font-black text-[14px] uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all"
                                >
                                    No, Keep it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
