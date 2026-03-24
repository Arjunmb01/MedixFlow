import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
    currentMonth: Date;
    selectedDate: Date | null;
    availableDays: number[]; // 0 for Sunday, 1 for Monday, etc.
    onDateSelect: (date: Date) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({
    currentMonth,
    selectedDate,
    availableDays,
    onDateSelect,
    onPrevMonth,
    onNextMonth
}) => {
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [currentMonth]);

    const isSameDate = (d1: Date, d2: Date | null) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    const isAvailable = (date: Date) => {
        return availableDays.includes(date.getDay());
    };

    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em]">Select Date</h3>
                <div className="flex items-center gap-3">
                    <button onClick={onPrevMonth} className="p-2.5 rounded-xl border border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors active:scale-95">
                        <ChevronLeft className="w-5 h-5 text-[#64748B]" />
                    </button>
                    <button onClick={onNextMonth} className="p-2.5 rounded-xl border border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors active:scale-95">
                        <ChevronRight className="w-5 h-5 text-[#64748B]" />
                    </button>
                </div>
            </div>
            
            <div className="mb-8">
                <h4 className="text-[22px] font-black text-[#0F172A] tracking-tight capitalize">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h4>
            </div>

            <div className="grid grid-cols-7 gap-y-3 gap-x-3 text-center">
                {dayNames.map(day => (
                    <div key={day} className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] py-4">
                        {day}
                    </div>
                ))}
                {calendarDays.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;
                    
                    const isPast = date < new Date(new Date().setHours(0,0,0,0));
                    const isSelected = isSameDate(date, selectedDate);
                    const isToday = isSameDate(date, new Date());
                    const available = isAvailable(date);

                    return (
                        <button 
                            key={date.toISOString()}
                            disabled={isPast || !available}
                            onClick={() => onDateSelect(date)}
                            className={`aspect-square w-full flex flex-col items-center justify-center rounded-[1.25rem] transition-all relative group ${
                                isSelected 
                                ? "bg-[#3B82F6] text-white shadow-xl shadow-blue-100 ring-4 ring-white" 
                                : isPast || !available
                                    ? "text-[#CBD5E1] cursor-not-allowed opacity-40" 
                                    : "bg-[#F8FAFC] text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[#3B82F6] border border-transparent hover:border-[#BFDBFE]"
                            }`}
                        >
                            <span className="text-base font-black tracking-tight">{date.getDate()}</span>
                            {isToday && !isSelected && (
                                <div className="absolute bottom-2 w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                            )}
                        </button>
                    )
                })}
            </div>
        </section>
    );
};
