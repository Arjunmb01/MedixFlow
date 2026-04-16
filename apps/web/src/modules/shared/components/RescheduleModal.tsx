import React, { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/modules/patient/components/booking/Calendar";
import { SlotPicker, type SlotInfo } from "@/modules/patient/components/booking/SlotPicker";
import { getAvailableSlots } from "@/infrastructure/api/appointment.api";
import { rescheduleAppointment as reschedulePatient } from "@/infrastructure/api/patient.api";
import { rescheduleAppointment as rescheduleDoctor } from "@/infrastructure/api/doctor.api";
import { rescheduleAppointment as rescheduleAdmin } from "@/infrastructure/api/admin.api";
import { toast } from "sonner";
import { X, CalendarClock, Loader2, CheckCircle2 } from "lucide-react";

export type RescheduleRole = "patient" | "doctor" | "admin";

interface RescheduleModalProps {
    appointmentId: string;
    doctorId: string;
    availableDays?: number[];
    role: RescheduleRole;
    onSuccess: () => void;
    onClose: () => void;
}

function toISODate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
    appointmentId,
    doctorId,
    availableDays = [0, 1, 2, 3, 4, 5, 6],
    role,
    onSuccess,
    onClose,
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [slots, setSlots] = useState<SlotInfo[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchSlots = useCallback(async (date: Date) => {
        setLoadingSlots(true);
        setSlots([]);
        setSelectedSlot(null);
        try {
            const data = await getAvailableSlots(doctorId, date);
            setSlots(data);
        } catch {
            toast.error("Failed to load available slots.");
        } finally {
            setLoadingSlots(false);
        }
    }, [doctorId]);

    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate, fetchSlots]);

    const handleConfirm = async () => {
        if (!selectedDate || !selectedSlot) {
            toast.error("Please select a date and time slot.");
            return;
        }
        setSubmitting(true);
        try {
            const dateStr = toISODate(selectedDate);
            if (role === "patient") {
                await reschedulePatient(appointmentId, dateStr, selectedSlot.start, selectedSlot.end);
            } else if (role === "doctor") {
                await rescheduleDoctor(appointmentId, dateStr, selectedSlot.start, selectedSlot.end);
            } else {
                await rescheduleAdmin(appointmentId, dateStr, selectedSlot.start, selectedSlot.end);
            }
            toast.success("Appointment rescheduled successfully!");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reschedule appointment.");
        } finally {
            setSubmitting(false);
        }
    };

    const prevMonth = () =>
        setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    const nextMonth = () =>
        setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

    const theme = {
        patient: { accent: "#3B82F6", accentBg: "bg-blue-600", accentHover: "hover:bg-blue-700", ring: "ring-blue-200", shadow: "shadow-blue-200" },
        doctor:  { accent: "#0d9488",  accentBg: "bg-teal-600",  accentHover: "hover:bg-teal-700",  ring: "ring-teal-200",  shadow: "shadow-teal-200"  },
        admin:   { accent: "#7C3AED", accentBg: "bg-violet-600", accentHover: "hover:bg-violet-700", ring: "ring-violet-200", shadow: "shadow-violet-200" },
    }[role];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${theme.accent}18` }}
                        >
                            <CalendarClock className="w-6 h-6" style={{ color: theme.accent }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Reschedule Appointment</h2>
                            <p className="text-sm font-medium text-gray-400 mt-0.5">Choose a new date and time slot</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-8 space-y-8">

                    <Calendar
                        currentMonth={currentMonth}
                        selectedDate={selectedDate}
                        availableDays={availableDays}
                        onDateSelect={setSelectedDate}
                        onPrevMonth={prevMonth}
                        onNextMonth={nextMonth}
                    />


                    {selectedDate && (
                        <div>
                            {loadingSlots ? (
                                <div className="flex items-center gap-3 py-8 justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: theme.accent }} />
                                    <span className="text-sm font-bold text-gray-400">Loading available slots...</span>
                                </div>
                            ) : (
                                <SlotPicker
                                    slots={slots}
                                    selectedSlot={selectedSlot}
                                    onSlotSelect={setSelectedSlot}
                                />
                            )}
                        </div>
                    )}

                    {selectedDate && selectedSlot && (
                        <div
                            className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
                            style={{ backgroundColor: `${theme.accent}0d`, borderColor: `${theme.accent}30` }}
                        >
                            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: theme.accent }} />
                            <p className="text-sm font-black" style={{ color: theme.accent }}>
                                {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                &nbsp;·&nbsp;
                                {selectedSlot.start} – {selectedSlot.end}
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-8 py-6 border-t border-gray-100 flex gap-3 shrink-0">
                    <button
                        onClick={handleConfirm}
                        disabled={submitting || !selectedDate || !selectedSlot}
                        className={`flex-1 py-4 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 ${theme.accentBg} ${theme.accentHover} shadow-${theme.shadow}`}
                    >
                        {submitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Rescheduling...</>
                        ) : (
                            <><CheckCircle2 className="w-5 h-5" /> Confirm Reschedule</>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-white text-gray-500 border border-gray-200 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
