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
import { getAvailableSlots, bookAppointment } from "@/infrastructure/api/appointment.api";

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

                        {/* Summary Footer */}
                        <div className="p-10 bg-white border-t border-[#F1F5F9] flex flex-col md:flex-row justify-between items-center gap-8">
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
                                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Estimated Fee</p>
                                <p className="text-[34px] font-black text-[#0F172A] tracking-tighter mt-1">₹{doctor.consultationFee}.00</p>
                            </div>
                            <button
                                disabled={!selectedDate || !selectedSlot || isBooking}
                                onClick={async () => {
                                    if (!selectedDate || !selectedSlot || !profile?.id || !id) return;
                                    setIsBooking(true);
                                    try {
                                        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                                        await bookAppointment({
                                            patientId: profile.id,
                                            doctorId: id,
                                            date: dateStr,
                                            slotStart: selectedSlot.start,
                                            slotEnd: selectedSlot.end
                                        });
                                        setBookingSuccess(true);
                                    } catch (error: any) {
                                        console.error("Booking failed:", error);
                                        const errorMsg = error.response?.data?.message || "Failed to book appointment. Please try again.";
                                        alert(errorMsg);
                                    } finally {
                                        setIsBooking(false);
                                    }
                                }}
                                className={`w-full md:w-auto px-16 py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex justify-center items-center ${
                                    selectedDate && selectedSlot && !isBooking
                                    ? "bg-[#3B82F6] text-white shadow-blue-100 hover:bg-[#2563EB]"
                                    : "bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed shadow-none"
                                }`}
                            >
                                {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Appointment"}
                            </button>
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
        </div>
    );
}
