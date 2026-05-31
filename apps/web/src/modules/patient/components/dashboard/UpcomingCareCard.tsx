import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, X, Loader2, CheckCircle, Video } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cancelAppointment } from "@/infrastructure/api/patient.api"
import { checkIn } from "@/infrastructure/api/consultation.api"

interface Appointment {
    id: string;
    doctorName: string;
    date: string | Date;
    slotStart: string;
    consultationType?: "VIDEO" | "CLINIC";
    hasConsultation?: boolean;
}

interface Props {
    appointment: Appointment | null;
}

export default function UpcomingCareCard({ appointment }: Props) {
    const navigate = useNavigate();
    const isVideo = appointment?.consultationType === "VIDEO";
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [refundToWallet, setRefundToWallet] = useState(true);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [hasCheckedIn, setHasCheckedIn] = useState(!!appointment?.hasConsultation);

    useEffect(() => {
        if (appointment?.hasConsultation) {
            setHasCheckedIn(true);
        }
    }, [appointment]);

    const handleCheckIn = async () => {
        if (!appointment?.id) return;
        setIsCheckingIn(true);
        try {
            await checkIn(appointment.id);
            setHasCheckedIn(true);
        } catch (error: any) {
            console.error("Check-in failed", error);
            if (error.response?.data?.message?.includes("already checked in")) {
                setHasCheckedIn(true);
            } else {
                alert("Failed to check in. Please try again.");
            }
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleCancel = async () => {
        if (!appointment?.id || !reason) return;
        setIsCancelling(true);
        try {
            await cancelAppointment(appointment.id, reason, refundToWallet);
            window.location.reload();
        } catch (error) {
            console.error("Cancellation failed", error);
            alert("Failed to cancel appointment. Please try again.");
            setIsCancelling(false);
        }
    };

    if (!appointment) {
        return (
            <div className="bg-gray-50/80 rounded-[40px] p-8 text-gray-400 relative overflow-hidden border border-gray-100 h-full flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                    <Calendar className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="text-[20px] font-black tracking-tight text-gray-900 leading-tight">No Active Schedules</h3>
                <p className="text-[13px] mt-2 font-bold uppercase tracking-widest">Book a consultation to begin</p>
                <button
                    onClick={() => window.location.href = '/find-doctors'}
                    className="mt-8 bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-[14px] flex items-center gap-2 hover:bg-primary-700 transition-all shadow-xl shadow-primary-100"
                >
                    Book Appointment
                </button>
            </div>
        );
    }

    const appDate = new Date(appointment.date);
    const isToday = (date: string | Date): boolean => {
        const d = new Date(date);
        const now = new Date();
        return d.getFullYear() === now.getFullYear() &&
               d.getMonth() === now.getMonth() &&
               d.getDate() === now.getDate();
    };

    const dateFormatted = appDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const canCheckIn = (date: string | Date, time: string): boolean => {
        const now = new Date();
        const d = new Date(date);
        
        const appt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const [hours, minutes] = time.split(':').map(Number);
        appt.setHours(hours, minutes, 0, 0);

        const diff = (appt.getTime() - now.getTime()) / (1000 * 60);
        return diff <= 15 && diff >= -10;
    };


    return (
        <>
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[40px] p-10 text-white relative overflow-hidden shadow-[0_30px_60px_rgba(13,148,136,0.15)] h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-400/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-[11px] font-black tracking-[0.3em] opacity-60 uppercase">Primary Workspace</span>
                            <h2 className="text-[28px] font-black tracking-tight leading-tight">Upcoming Care</h2>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-[20px] text-[13px] font-black border border-white/20 flex items-center gap-2 shadow-lg">
                            <Clock className="w-4 h-4" />
                            {isToday(appointment.date) ? "Today" : dateFormatted}, {appointment.slotStart}
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[24px] border border-white/20 flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                            {appointment.doctorName.split(' ').map(n => n[0]).join('').replace('Dr', '')}
                        </div>
                        <div>
                            <h3 className="text-[32px] font-black tracking-tighter leading-none">{appointment.doctorName}</h3>
                            <div className="flex items-center gap-2 mt-2.5 opacity-60 text-[14px] font-black uppercase tracking-widest">
                                {isVideo ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                <span>{isVideo ? "Video Consultation" : "Physical Clinic"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-wrap gap-4">
                        {isVideo && canCheckIn(appointment.date, appointment.slotStart) && (
                            <button
                                onClick={() => navigate(`/consultation/video/${appointment.id}`)}
                                className="bg-white text-primary-600 px-8 py-4.5 rounded-2xl font-black text-[15px] flex items-center gap-3 hover:bg-gray-50 transition-all shadow-2xl shadow-black/10 group"
                            >
                                <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Join Consultation
                            </button>
                        )}
                        {!isVideo && canCheckIn(appointment.date, appointment.slotStart) && !hasCheckedIn && (
                            <button
                                onClick={handleCheckIn}
                                disabled={isCheckingIn}
                                className="bg-white text-primary-600 px-8 py-4.5 rounded-2xl font-black text-[15px] flex items-center gap-3 hover:bg-gray-50 transition-all shadow-2xl shadow-black/10 disabled:opacity-70 group"
                            >
                                {isCheckingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                Check-In Now
                            </button>
                        )}
                        {canCheckIn(appointment.date, appointment.slotStart) && hasCheckedIn && (
                            <div className="bg-white/10 backdrop-blur-xl text-white px-8 py-4.5 rounded-2xl font-black text-[15px] flex items-center gap-3 border border-white/20">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                Verified At Clinic
                            </div>
                        )}
                        {!canCheckIn(appointment.date, appointment.slotStart) && (
                            <button className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-8 py-4.5 rounded-2xl font-black text-[15px] flex items-center gap-3 hover:bg-white/20 transition-all shadow-xl group">
                                <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Appointment Details
                            </button>
                        )}
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-transparent px-8 py-4.5 rounded-2xl font-black text-[15px] transition-all text-white/50 hover:text-white"
                        >
                            Cancel Access
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-[0_40px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-[26px] font-black text-gray-900 tracking-tight">Cancel Scheduling</h3>
                                <p className="text-[13px] text-gray-400 font-bold uppercase tracking-widest mt-1">This action cannot be undone</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-[15px] text-gray-500 mb-8 font-bold leading-relaxed">
                            Confirm removal of your consultation with <strong className="text-gray-900 font-black">{appointment.doctorName}</strong> on {isToday(appointment.date) ? "Today" : dateFormatted} at {appointment.slotStart}.
                        </p>

                        <div className="space-y-6">
                            <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Reason for Cancellation</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Explain the requirement for cancellation..."
                                        className="w-full h-32 px-5 py-4 rounded-3xl bg-gray-50 border-2 border-gray-50 focus:bg-white focus:border-red-500/20 focus:ring-8 focus:ring-red-50/30 text-[14px] font-bold text-gray-900 outline-none resize-none transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-emerald-900 uppercase tracking-widest leading-none">Refund Method</p>
                                                <p className="text-[15px] font-black text-emerald-600 mt-1">Credit to Wallet</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setRefundToWallet(!refundToWallet)}
                                            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${refundToWallet ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${refundToWallet ? 'left-8' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <p className="mt-4 text-[11px] font-bold text-emerald-600/60 leading-relaxed uppercase tracking-wider">
                                        {refundToWallet 
                                            ? "Funds will be available instantly in your MedixFlow wallet"
                                            : "Refund will be processed back to original source (Stripe/PayPal)"}
                                    </p>
                                </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={isCancelling}
                                    className="flex-1 py-4.5 px-6 rounded-2xl font-black text-[15px] text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isCancelling || !reason.trim()}
                                    className="flex-1 py-4.5 px-6 rounded-2xl font-black text-[15px] text-white bg-red-600 hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex justify-center items-center gap-3 active:scale-[0.98]"
                                >
                                    {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Cancel"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
