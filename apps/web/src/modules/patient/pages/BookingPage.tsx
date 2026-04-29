import Sidebar from "../components/dashboard/Sidebar";
import TopNav from "../components/dashboard/TopNav";
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile";
import { useDoctorDetails } from "@/application/doctor/hooks/useDoctorDetails";
import { useParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
    Star,
    Building2,
    Clock,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { Calendar } from "../components/booking/Calendar";
import { SlotPicker } from "../components/booking/SlotPicker";
import type { SlotInfo } from "../components/booking/SlotPicker";
import { getAvailableSlots, bookAppointment, getWalletBalance } from "@/infrastructure/api/appointment.api";
import { toast } from "sonner";

export default function BookingPage() {
    const { id = "" } = useParams();
    const { profile } = usePatientProfile();
    const { doctor, loading } = useDoctorDetails(id);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | null>("Banglore");
    const [notes, setNotes] = useState("");

    // Slots state - fetched from API
    const [slots, setSlots] = useState<SlotInfo[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // Booking state
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "WALLET" | "STRIPE" | "PAYPAL">("STRIPE");
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);
    const [useWallet, setUseWallet] = useState(false);

    const remainingAmount = useMemo(() => {
        if (!doctor) return 0;
        const fee = doctor.consultationFee;
        if (!useWallet || walletBalance === null) return fee;
        return Math.max(0, fee - walletBalance);
    }, [doctor, useWallet, walletBalance]);

    const walletContribution = useMemo(() => {
        if (!doctor || !useWallet || walletBalance === null) return 0;
        return Math.min(doctor.consultationFee, walletBalance);
    }, [doctor, useWallet, walletBalance]);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Fetch wallet balance
    useEffect(() => {
        getWalletBalance()
            .then(data => setWalletBalance(data.wallet?.balance || 0))
            .catch(() => setWalletBalance(0));
    }, []);

    // Availability Logic
    const availableDays = useMemo(() => {
        return (doctor?.schedules || []).map(s => s.dayOfWeek);
    }, [doctor]);

    const availabilityStatus = useMemo(() => {
        if (!doctor || !doctor.schedules?.length) return { text: "No availability", color: "text-[#94A3B8]" };

        const dayOfWeekToday = new Date().getDay();
        const isAvailableToday = availableDays.includes(dayOfWeekToday);

        if (isAvailableToday) {
            return { text: "Available today", color: "text-[#10B981]" };
        }

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let nextDay = (dayOfWeekToday + 1) % 7;
        let attempts = 0;
        while (!availableDays.includes(nextDay) && attempts < 7) {
            nextDay = (nextDay + 1) % 7;
            attempts++;
        }

        if (attempts < 7) {
            const isTomorrow = nextDay === (dayOfWeekToday + 1) % 7;
            return { text: `Available ${isTomorrow ? "tomorrow" : "on " + dayNames[nextDay]}`, color: "text-[#3B82F6]" };
        }

        return { text: "No upcoming availability", color: "text-[#94A3B8]" };
    }, [doctor, availableDays]);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Auto-select the first available date
    useMemo(() => {
        if (!selectedDate && availableDays.length > 0) {
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {
                if (availableDays.includes(checkDate.getDay())) {
                    setSelectedDate(new Date(checkDate));
                    setCurrentMonth(new Date(checkDate.getFullYear(), checkDate.getMonth(), 1));
                    break;
                }
                checkDate.setDate(checkDate.getDate() + 1);
            }
        }
    }, [availableDays, selectedDate]);

    // Fetch slots from API whenever the selected date or doctorId changes
    useEffect(() => {
        if (!selectedDate || !id) {
            setSlots([]);
            return;
        }
        setSlotsLoading(true);
        setSelectedSlot(null); // reset slot when date changes
        getAvailableSlots(id, selectedDate)
            .then(setSlots)
            .catch(() => setSlots([]))
            .finally(() => setSlotsLoading(false));
    }, [selectedDate, id]);

    const googleCalendarUrl = useMemo(() => {
        if (!selectedDate || !selectedSlot || !doctor) return "#";
        
        const baseDate = selectedDate.toISOString().split('T')[0].replace(/-/g, '');
        
        const parseTime = (timeStr: string) => {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}00`;
        };

        const start = parseTime(selectedSlot.start);
        const end = parseTime(selectedSlot.end);
        
        const title = encodeURIComponent(`Doctor Appointment with Dr. ${doctor.firstName} ${doctor.lastName}`);
        const details = encodeURIComponent(`Appointment at MedixFlow City Clinic. ${notes ? 'Notes: ' + notes : ''}`);
        
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${baseDate}T${start}/${baseDate}T${end}&details=${details}`;
    }, [selectedDate, selectedSlot, doctor, notes]);

    const locations = ["Banglore", "Banglore rural"];

    if (loading || !doctor) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC] flex-col font-outfit">
                <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[#64748B] font-bold">Fetching doctor details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-outfit">
            <Sidebar />

            <div className="flex-1 ml-64">
                <TopNav
                    userName={`${profile?.name}`}
                    patientId={profile?.patientId || "PX-202"}
                />

                <main className="pt-28 pb-12 px-8 max-w-5xl mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-8">
                        <Link to="/dashboard" className="hover:text-[#3B82F6] transition-colors">Dashboard</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link to="/find-doctors" className="hover:text-[#3B82F6] transition-colors">Find Doctors</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#0F172A]">Book Appointment</span>
                    </nav>

                    <div className="text-center mb-10">
                        <h1 className="text-[34px] font-black text-[#0F172A] tracking-tight mb-2">Book your Appointment</h1>
                        <p className="text-[#64748B] text-sm font-medium">Select a date and time that works best for you.</p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-[#E2E8F0] shadow-sm overflow-hidden mb-8">
                        {/* Doctor Info Card */}
                        <div className="p-8 border-b border-[#F1F5F9] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-start gap-6">
                                <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1.5 shrink-0">Doctor</div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Dr. {doctor.firstName} {doctor.lastName}</h2>
                                    <div className="text-[#64748B] text-sm font-bold mt-1">
                                        {doctor.specialty} • <span className="text-[#94A3B8]">Specialist</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-1.5 bg-[#FFFBEB] px-3 py-1 rounded-full border border-[#FEF3C7]">
                                            <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                                            <span className="text-xs font-black text-[#92400E]">4.9</span>
                                        </div>
                                        <span className="text-[#3B82F6] font-black text-sm tracking-tight">₹{doctor.consultationFee} / Session</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right flex items-start gap-4">
                                <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1.5">Clinic Details :</div>
                                <div className="text-[#64748B] text-sm font-black text-right">MedixFlow City Clinic</div>
                            </div>
                        </div>

                        {/* Success State */}
                        {bookingSuccess ? (
                            <div className="p-16 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-24 h-24 bg-[#10B981] rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 mb-4 animate-bounce">
                                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Appointment Confirmed!</h2>
                                <p className="text-[#64748B] text-lg font-medium max-w-md">
                                    Your appointment with Dr. {doctor.firstName} on {selectedDate?.toLocaleDateString()} at {selectedSlot?.start} has been successfully booked.
                                </p>
                                <div className="flex flex-col md:flex-row gap-4 mt-8">
                                    <button 
                                        onClick={() => window.location.href = '/dashboard'}
                                        className="px-10 py-4 bg-[#3B82F6] text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-blue-200 hover:bg-[#2563EB] transition-all"
                                    >
                                        Return to Dashboard
                                    </button>
                                    <a 
                                        href={googleCalendarUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-10 py-4 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-2xl font-black uppercase tracking-wider hover:border-[#CBD5E1] transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        Add to Calendar
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Booking Options */}
                                <div className="p-10 space-y-12">
                            {/* Type of Consultation */}
                            <section>
                                <h3 className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em] mb-6">Type of Consultation</h3>
                                <div className="flex gap-4">
                                    <div
                                        className="flex-1 py-4 px-6 rounded-2xl flex items-center justify-center gap-3 bg-[#EFF6FF] border-2 border-[#3B82F6] text-[#3B82F6] shadow-sm"
                                    >
                                        <Building2 className="w-5 h-5" />
                                        <span className="text-[13px] font-black uppercase tracking-wider">In Clinic Consultation</span>
                                    </div>
                                </div>
                            </section>

                            {/* Select Date */}
                            <Calendar
                                currentMonth={currentMonth}
                                selectedDate={selectedDate}
                                availableDays={availableDays}
                                onDateSelect={setSelectedDate}
                                onPrevMonth={handlePrevMonth}
                                onNextMonth={handleNextMonth}
                            />

                            {/* Status and Summary Info */}
                            <div className="flex items-center gap-6 p-6 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Doctor Status</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${availabilityStatus.text.includes("today") ? "bg-[#10B981]" : "bg-[#3B82F6]"}`} />
                                        <span className={`text-sm font-black ${availabilityStatus.color}`}>{availabilityStatus.text}</span>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-[#E2E8F0]" />
                                <div className="w-px h-8 bg-[#E2E8F0]" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Slot Duration</span>
                                    <span className="text-sm font-black text-[#0F172A]">
                                        {selectedSlot ? 'Duration set' : (doctor.schedules?.[0]?.slotDurationMinutes || 15) + ' mins per slot'}
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-[#E2E8F0]" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Patients per Slot</span>
                                    <span className="text-sm font-black text-[#0F172A]">
                                        {selectedSlot ? `Up to ${selectedSlot.capacity} patients` : `Up to ${doctor.schedules?.[0]?.slotCapacity || 1} patients`}
                                    </span>
                                </div>
                            </div>

                            {/* Time Slot */}
                            {slotsLoading ? (
                                <div className="flex items-center justify-center py-12 gap-3">
                                    <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                                    <span className="text-[#64748B] font-bold text-sm">Loading available slots...</span>
                                </div>
                            ) : selectedDate ? (
                                <SlotPicker
                                    slots={slots}
                                    selectedSlot={selectedSlot}
                                    onSlotSelect={setSelectedSlot}
                                />
                            ) : (
                                <div className="p-10 text-center bg-[#F8FAFC] rounded-[2rem] border-2 border-dashed border-[#E2E8F0]">
                                    <Clock className="w-10 h-10 text-[#CBD5E1] mx-auto mb-4" />
                                    <p className="text-[#64748B] font-bold">Please select an available date to see time slots.</p>
                                </div>
                            )}

                            {/* Location */}
                            <section className="bg-[#F8FAFC] p-8 rounded-[2rem] border border-dashed border-[#E2E8F0]">
                                <h3 className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em] mb-6">Select Location</h3>
                                <div className="flex flex-wrap gap-4">
                                    {locations.map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => setSelectedLocation(loc)}
                                            className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border-2 ${
                                                selectedLocation === loc
                                                ? "bg-white border-[#3B82F6] text-[#3B82F6] shadow-sm"
                                                : "bg-white/50 border-transparent text-[#94A3B8] hover:border-[#E2E8F0] grayscale opacity-70"
                                            }`}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-4 text-[10px] font-bold text-[#94A3B8] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full" />
                                    Location management will be integrated soon.
                                </p>
                            </section>

                            {/* Notes for Doctor */}
                            <section>
                                <h3 className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em] mb-4">Notes for Doctor :</h3>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Briefly describe your symptoms or any specific concerns for the doctor..."
                                    className="w-full h-36 p-8 rounded-[2rem] bg-[#F8FAFC] border-2 border-[#F1F5F9] focus:border-[#3B82F6] focus:bg-white text-sm text-[#0F172A] font-medium transition-all outline-none resize-none placeholder:text-[#94A3B8]"
                                />
                            </section>
                        </div>

                        <div className="p-10 bg-white border-t border-[#F1F5F9] space-y-8">
                            {/* Wallet Deduction Option */}
                            {walletBalance !== null && walletBalance > 0 && (
                                <section className="p-6 bg-[#ECFDF5] rounded-2xl border border-[#D1FAE5]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#065F46]">Use Wallet Balance</p>
                                                <p className="text-[11px] text-[#047857] font-bold">Current Balance: ₹{walletBalance}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setUseWallet(!useWallet)}
                                            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${useWallet ? 'bg-[#10B981]' : 'bg-[#D1FAE5]'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${useWallet ? 'left-8' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Payment Method Selector */}
                            <section>
                                <h3 className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em] mb-4">
                                    {remainingAmount === 0 ? "Payment covered by Wallet" : "Select Payment Method for Remaining Amount"}
                                </h3>
                                {remainingAmount > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <button
                                            onClick={() => setPaymentMethod("STRIPE")}
                                            className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                                paymentMethod === "STRIPE"
                                                ? "border-[#3B82F6] bg-blue-50/50"
                                                : "border-[#F1F5F9] hover:border-[#E2E8F0]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M13.911 10.053l-3.334 1.488c-.602.269-.745.549-.745.895 0 .524.492.834 1.258.834 1.107 0 2.215-.405 3.238-.976l.167 1.631c-.88.428-1.928.714-3.155.714-2.143 0-3.417-1.119-3.417-2.738 0-1.762 1.357-2.619 3.5-3.572l3.357-1.5c.667-.286.738-.595.738-.881 0-.476-.405-.738-1.214-.738-.857 0-1.833.31-2.667.738l-.214-1.619c.952-.476 2.095-.738 3.238-.738 2.048 0 3.19.976 3.19 2.5 0 1.548-1.19 2.405-3.619 3.5zM22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"/>
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-[#0F172A]">Stripe / Cards</p>
                                                    <p className="text-[11px] text-[#64748B] font-bold">Secure Global Payments</p>
                                                </div>
                                            </div>
                                            {paymentMethod === "STRIPE" && <div className="w-5 h-5 bg-[#3B82F6] rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>}
                                        </button>

                                        {/* <button
                                            onClick={() => setPaymentMethod("PAYPAL")}
                                            className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                                paymentMethod === "PAYPAL"
                                                ? "border-[#3B82F6] bg-blue-50/50"
                                                : "border-[#F1F5F9] hover:border-[#E2E8F0]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-blue-800" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M20.067 8.178c-.652 4.966-4.286 6.087-8.171 6.087h-1.682l-.687 4.385c-.052.333-.341.579-.679.579H5.705a.434.434 0 01-.429-.501l2.421-15.421a1.233 1.233 0 011.221-1.04h5.682c3.483 0 5.438 1.63 4.887 5.289l-.043.272c-.081.545-.308 1.054-.677 1.35z"/>
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-[#0F172A]">PayPal</p>
                                                    <p className="text-[11px] text-[#64748B] font-bold">Fast and Secure</p>
                                                </div>
                                            </div>
                                            {paymentMethod === "PAYPAL" && <div className="w-5 h-5 bg-[#3B82F6] rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>}
                                        </button> */}

                                        <button
                                            onClick={() => setPaymentMethod("RAZORPAY")}
                                            className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                                paymentMethod === "RAZORPAY"
                                                ? "border-[#3B82F6] bg-blue-50/50"
                                                : "border-[#F1F5F9] hover:border-[#E2E8F0]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-[#0F172A]">Razorpay / Cards / UPI</p>
                                                    <p className="text-[11px] text-[#64748B] font-bold">Secure Online Payment</p>
                                                </div>
                                            </div>
                                            {paymentMethod === "RAZORPAY" && <div className="w-5 h-5 bg-[#3B82F6] rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-emerald-50 rounded-2xl border-2 border-emerald-200 border-dashed text-center">
                                        <p className="text-[#065F46] font-black tracking-tight">Full amount will be deducted from your wallet balance.</p>
                                    </div>
                                )}
                            </section>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="space-y-2 text-center md:text-left">
                                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Selected Date &amp; Time</p>
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <span className="text-xl font-black text-[#0F172A] tracking-tight">
                                            {selectedDate ? selectedDate.toLocaleDateString("default", { month: "short", day: "numeric" }) : "Select Date"}
                                        </span>
                                        <span className="text-[#CBD5E1] font-bold text-xl">•</span>
                                        <span className="text-xl font-black text-[#3B82F6] tracking-tight">
                                            {selectedSlot
                                                ? `${selectedSlot.start} – ${selectedSlot.end}`
                                                : "Select Slot"}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Summary</p>
                                    <div className="flex flex-col gap-1 mt-1">
                                        {walletContribution > 0 && (
                                            <p className="text-xs font-bold text-[#10B981]">- ₹{walletContribution} (Wallet)</p>
                                        )}
                                        <p className="text-[34px] font-black text-[#0F172A] tracking-tighter">
                                            {remainingAmount === 0 ? "FREE" : `₹${remainingAmount}.00`}
                                        </p>
                                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                            Total Fee: ₹{doctor.consultationFee}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    disabled={!selectedDate || !selectedSlot || isBooking || (useWallet && remainingAmount === 0 && walletBalance !== null && walletBalance < doctor.consultationFee)}
                                    onClick={async () => {
                                        if (!selectedDate || !selectedSlot || !profile?.id || !id) return;
                                        setIsBooking(true);
                                        let isRedirecting = false;
                                        try {
                                            const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                                            // When wallet covers the full amount, send WALLET as paymentMethod
                                            const effectivePaymentMethod = (useWallet && remainingAmount === 0) ? "WALLET" as const : paymentMethod;
                                            const apiResponse = await bookAppointment({
                                                patientId: profile.id,
                                                doctorId: id,
                                                date: dateStr,
                                                slotStart: selectedSlot.start,
                                                slotEnd: selectedSlot.end,
                                                paymentMethod: effectivePaymentMethod,
                                                useWallet
                                            });
                                            console.log("Booking API Response:", apiResponse);
                                            
                                            const bookingData = apiResponse.data;
                                            setPendingAppointmentId(bookingData.id);

                                            if (bookingData.razorpayOrderId) {
                                                // Razorpay flow - open modal
                                                const options = {
                                                    key: bookingData.razorpayKeyId,
                                                    amount: bookingData.amount * 100, 
                                                    currency: bookingData.currency || "INR",
                                                    name: "MedixFlow",
                                                    description: `Appointment with Dr. ${doctor.firstName}`,
                                                    order_id: bookingData.razorpayOrderId,
                                                    handler: function (_res: any) {
                                                        // Payment succeeded
                                                        setBookingSuccess(true);
                                                        setIsBooking(false);
                                                    },
                                                    prefill: {
                                                        name: profile.name,
                                                        email: profile.email || "",
                                                    },
                                                    theme: {
                                                        color: "#3B82F6",
                                                    },
                                                    modal: {
                                                        ondismiss: function() {
                                                            setIsBooking(false);
                                                        }
                                                    }
                                                };
                                                const rzp = new (window as any).Razorpay(options);
                                                rzp.open();
                                                return; 
                                            } else if (bookingData.stripeUrl) {
                                                isRedirecting = true;
                                                console.log("Redirecting to Stripe:", bookingData.stripeUrl);
                                                window.location.href = bookingData.stripeUrl;
                                                return; 
                                            } else if (bookingData.paypalUrl) {
                                                isRedirecting = true;
                                                window.location.href = bookingData.paypalUrl;
                                                return; 
                                            } else {

                                                setBookingSuccess(true);
                                            }
                                        } catch (error: any) {
                                            console.error("Booking failed:", error);
                                            const errorMsg = error.response?.data?.message || error.message || "Failed to book appointment. Please try again.";
                                            toast.error(errorMsg);
                                        } finally {
                                            if (!isRedirecting) {
                                                setIsBooking(false);
                                            }
                                        }
                                    }}
                                    className={`w-full md:w-auto px-16 py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex justify-center items-center ${
                                        selectedDate && selectedSlot && !isBooking && (remainingAmount === 0 || (walletBalance !== null && walletBalance >= walletContribution))
                                        ? "bg-[#3B82F6] text-white shadow-blue-100 hover:bg-[#2563EB]"
                                        : "bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed shadow-none"
                                    }`}
                                >
                                    {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                                     (useWallet && walletBalance !== null && walletBalance < doctor.consultationFee && remainingAmount === 0) ? "Insufficient Balance" : "Confirm Appointment"}
                                </button>
                            </div>
                        </div>
                        </>
                        )}
                    </div>
                </main>
            </div>

            {/* Help Button */}
            <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#3B82F6] text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-200 hover:scale-110 active:scale-95 transition-all text-2xl">
                ✨
            </button>

            {/* Payment Simulation Controls (Test Mode Only) */}
            {isBooking && paymentMethod === "STRIPE" && (
                <div className="fixed bottom-32 right-10 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest text-right px-2">Simulate Payment (Stripe)</p>
                    <button 
                        onClick={async () => {
                            if (!pendingAppointmentId) return;
                            try {
                                const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/simulate`, {
                                    method: 'POST',
                                    headers: { 
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('token')}` 
                                    },
                                    body: JSON.stringify({ appointmentId: pendingAppointmentId, status: 'success' })
                                });
                                if (response.ok) {
                                    setBookingSuccess(true);
                                    setIsBooking(false);
                                }
                            } catch (err) {
                                console.error("Simulation failed", err);
                            }
                        }}
                        className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center gap-2"
                    >
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Simulate Success
                    </button>
                    <button 
                        onClick={async () => {
                            if (!pendingAppointmentId) return;
                            try {
                                const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/simulate`, {
                                    method: 'POST',
                                    headers: { 
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('token')}` 
                                    },
                                    body: JSON.stringify({ appointmentId: pendingAppointmentId, status: 'failure' })
                                });
                                if (response.ok) {
                                    // On failure, redirect to billing
                                    window.location.href = `/patient/billing?status=failed&appointmentId=${pendingAppointmentId}`;
                                }
                            } catch (err) {
                                console.error("Simulation failed", err);
                            }
                        }}
                        className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all flex items-center gap-2"
                    >
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Simulate Failure
                    </button>
                </div>
            )}
        </div>
    );
}
