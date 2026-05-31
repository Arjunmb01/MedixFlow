import React from 'react';
import { Users, Video, MapPin } from 'lucide-react';

export interface SlotInfo {
    start: string;
    end: string;
    capacity: number;
    booked: number;
    available: number;
    isFull: boolean;
    isPast: boolean;
    consultationType?: "VIDEO" | "CLINIC";
}

interface SlotPickerProps {
    slots: SlotInfo[];
    selectedSlot: SlotInfo | null;
    onSlotSelect: (slot: SlotInfo) => void;
}

function formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
    slots,
    selectedSlot,
    onSlotSelect
}) => {
    if (!slots.length) {
        return (
            <section>
                <h3 className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em] mb-4">Select Time Slot</h3>
                <p className="text-sm text-[#94A3B8]">No slots available for this date.</p>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em]">Select Time Slot</h3>
                <span className="text-[10px] font-bold text-[#64748B] bg-[#F1F5F9] px-3 py-1 rounded-full">
                    {slots.length} slots available
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map(slot => {
                    const isSelected = selectedSlot?.start === slot.start;
                    const isDisabled = slot.isFull || slot.isPast;
                    const capacityPercent = 100;
                    const capacityColor = slot.isPast
                        ? 'text-gray-400'
                        : slot.isFull
                        ? 'text-[#F59E0B]'
                        : 'text-[#10B981]';

                    return (
                        <button
                            key={slot.start}
                            disabled={isDisabled}
                            onClick={() => onSlotSelect(slot)}
                            className={`group relative p-4 rounded-2xl text-left transition-all border-2 ${
                                isDisabled
                                    ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-50 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-[#EFF6FF] border-[#3B82F6] shadow-md shadow-blue-50'
                                    : 'bg-[#F8FAFC] border-transparent hover:bg-white hover:border-[#E2E8F0] hover:shadow-sm'
                            }`}
                        >
                            {/* Time range */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-[13px] font-black tracking-tight ${isSelected ? 'text-[#3B82F6]' : 'text-[#0F172A]'} ${isDisabled ? 'line-through text-[#94A3B8]' : ''}`}>
                                    {formatTime(slot.start)} – {formatTime(slot.end)}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    slot.consultationType === "VIDEO"
                                        ? "bg-violet-100 text-violet-700"
                                        : "bg-slate-100 text-slate-600"
                                }`}>
                                    {slot.consultationType === "VIDEO" ? (
                                        <><Video className="w-3 h-3" /> Video</>
                                    ) : (
                                        <><MapPin className="w-3 h-3" /> Clinic</>
                                    )}
                                </span>
                                {slot.isFull && (
                                    <span className="text-[10px] font-black text-[#EF4444] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                        FULL
                                    </span>
                                )}
                                {slot.isPast && !slot.isFull && (
                                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                        PAST
                                    </span>
                                )}
                            </div>

                            {/* Capacity bar */}
                            <div className="mb-2">
                                <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            slot.isPast ? 'bg-gray-200' : slot.isFull ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                                        }`}
                                        style={{ width: `${capacityPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Spots info */}
                            <div className="flex items-center gap-1.5">
                                <Users className={`w-3 h-3 ${capacityColor}`} />
                                <span className={`text-[11px] font-bold ${capacityColor}`}>
                                    {slot.isFull
                                        ? "Already Booked"
                                        : slot.isPast
                                        ? "Unavailable"
                                        : "Slot Available"
                                    }
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
