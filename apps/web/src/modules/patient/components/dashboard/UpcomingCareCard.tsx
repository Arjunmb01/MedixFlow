import { useState } from "react";
import { Calendar, Clock, MapPin, X, Loader2 } from "lucide-react"
import { cancelAppointment } from "@/infrastructure/api/patient.api"

interface Appointment {
    id: string;
    doctorName: string;
    date: string;
    slotStart: string;
}

interface Props {
    appointment: Appointment | null;
}

export default function UpcomingCareCard({ appointment }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        if (!appointment?.id || !reason) return;
        setIsCancelling(true);
        try {
            await cancelAppointment(appointment.id, reason);
            window.location.reload();
        } catch (error) {
            console.error("Cancellation failed", error);
            alert("Failed to cancel appointment. Please try again.");
            setIsCancelling(false);
        }
    };

    if (!appointment) {
        return (
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-[2.5rem] p-8 text-gray-500 relative overflow-hidden shadow-sm border border-gray-200 h-full flex flex-col justify-center items-center text-center">
                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-xl font-bold">No Upcoming Appointments</h3>
                <p className="text-sm mt-2">Book a consultation to see it here.</p>
                <button 
                    onClick={() => window.location.href = '/patient/find-doctors'}
                    className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
                >
                    Book Now
                </button>
            </div>
        );
    }

    const appDate = new Date(appointment.date);
    const dateFormatted = appDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isToday = new Date().toDateString() === appDate.toDateString();

    return (
        <>
        <div className="bg-gradient-to-br from-[#0066cc] to-[#004d99] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200 h-full flex flex-col justify-between">
            <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold tracking-[0.2em] opacity-80 uppercase">Upcoming Care</span>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-bold border border-white/20 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {isToday ? "Today" : dateFormatted}, {appointment.slotStart}
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-6">
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-[#0066cc] text-2xl font-bold shadow-xl">
                        {appointment.doctorName.split(' ').map(n => n[0]).join('').replace('Dr', '')}
                    </div>
                    <div>
                        <h3 className="text-[26px] font-bold tracking-tight">{appointment.doctorName}</h3>
                        <div className="flex items-center gap-2 mt-1.5 opacity-80 text-[14px] font-medium">
                            <MapPin className="w-4 h-4" />
                            <span>In-Clinic Consultation</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                    <button className="bg-white text-[#0066cc] px-6 py-3 rounded-2xl font-bold text-[14px] flex items-center gap-2 hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20">
                        <Calendar className="w-4 h-4" />
                        View Details
                    </button>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl font-bold text-[14px] hover:bg-white/20 transition-all text-white hover:text-red-100 hover:bg-red-500/20 hover:border-red-400"
                    >
                        Cancel Booking
                    </button>
                </div>
            </div>
        </div>

        {/* Cancellation Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Cancel Appointment</h3>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mb-6 font-medium">
                        Are you sure you want to cancel your appointment with <strong className="text-gray-900">{appointment.doctorName}</strong> on {isToday ? "Today" : dateFormatted} at {appointment.slotStart}?
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Reason for Cancellation</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please briefly explain why you are cancelling..."
                                className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-sm outline-none resize-none transition-all"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isCancelling}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Keep Appointment
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling || !reason.trim()}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
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