import React, { useState } from "react";
import { Calendar, Clock, Video, Phone, MapPin, Plus, Trash2, ChevronRight } from "lucide-react";

interface FollowUpData {
    scheduledDate: string;
    time: string;
    type: 'PHYSICAL' | 'VIDEO' | 'PHONE';
    reason?: string;
    notes?: string;
}

interface FollowUpSchedulerProps {
    data: FollowUpData | null;
    onChange: (data: FollowUpData | null) => void;
    disabled?: boolean;
}

export const FollowUpScheduler: React.FC<FollowUpSchedulerProps> = ({ data, onChange, disabled }) => {
    const [isScheduling, setIsScheduling] = useState(false);
    const [tempData, setTempData] = useState<FollowUpData>({
        scheduledDate: "",
        time: "",
        type: 'PHYSICAL',
        reason: "",
        notes: ""
    });

    const handleSchedule = () => {
        if (!tempData.scheduledDate || !tempData.time) return;
        onChange(tempData);
        setIsScheduling(false);
    };

    const handleCancel = () => {
        setIsScheduling(false);
        setTempData({
            scheduledDate: "",
            time: "",
            type: 'PHYSICAL',
            reason: "",
            notes: ""
        });
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl shadow-purple-50/50 mb-8 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50/30 rounded-full -mr-32 -mt-32 blur-3xl -z-10"></div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Follow-up Visit</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Scheduling & Recurrence</p>
                    </div>
                </div>
                
                {!data && !isScheduling && !disabled && (
                    <button 
                        onClick={() => setIsScheduling(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-100 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Schedule Follow-up
                    </button>
                )}
            </div>

            {isScheduling && !disabled && (
                <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 mb-0 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Date Selection */}
                        <div className="col-span-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Follow-up Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                <input 
                                    type="date" 
                                    value={tempData.scheduledDate}
                                    onChange={(e) => setTempData({...tempData, scheduledDate: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="col-span-3">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Preferred Time</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                <input 
                                    type="time" 
                                    value={tempData.time}
                                    onChange={(e) => setTempData({...tempData, time: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Consultation Type */}
                        <div className="col-span-5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Consultation Mode</label>
                            <div className="flex gap-2 p-1 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <button 
                                    onClick={() => setTempData({...tempData, type: 'PHYSICAL'})}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${tempData.type === 'PHYSICAL' ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase">Clinic</span>
                                </button>
                                <button 
                                    onClick={() => setTempData({...tempData, type: 'VIDEO'})}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${tempData.type === 'VIDEO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <Video className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase">Video</span>
                                </button>
                                <button 
                                    onClick={() => setTempData({...tempData, type: 'PHONE'})}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${tempData.type === 'PHONE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <Phone className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase">Phone</span>
                                </button>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="col-span-12">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Reason for Follow-up</label>
                            <input 
                                type="text" placeholder="e.g. Review lab results, post-op checkup..."
                                value={tempData.reason}
                                onChange={(e) => setTempData({...tempData, reason: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm"
                            />
                        </div>

                        <div className="col-span-12 flex justify-end gap-3 mt-4">
                            <button 
                                onClick={handleCancel}
                                className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSchedule}
                                disabled={!tempData.scheduledDate || !tempData.time}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-100 flex items-center gap-2 disabled:opacity-50"
                            >
                                Confirm Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {data && (
                <div className="flex items-stretch gap-6 bg-white border border-purple-100 rounded-[2rem] p-8 shadow-xl shadow-purple-50/50 animate-in fade-in zoom-in-95">
                    <div className="w-20 bg-purple-50 rounded-2xl flex flex-col items-center justify-center py-4">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-tighter">Month</span>
                        <span className="text-2xl font-black text-purple-700 leading-none my-1">
                            {new Date(data.scheduledDate).getDate()}
                        </span>
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-tighter">
                            {new Date(data.scheduledDate).toLocaleString('default', { month: 'short' })}
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-black text-gray-900">Follow-up Appointment</h3>
                            <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                                data.type === 'PHYSICAL' ? 'bg-purple-100 text-purple-700' : 
                                data.type === 'VIDEO' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                                {data.type} Visit
                            </span>
                            <span className="text-[9px] font-black px-2 py-1 bg-green-100 text-green-700 rounded-md uppercase tracking-tighter">
                                Free of Cost
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500 font-bold text-sm">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-purple-400" />
                                {data.time}
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                            <div className="flex items-center gap-1.5 capitalize">
                                {data.reason || "General Checkup"}
                            </div>
                        </div>
                    </div>

                    {!disabled && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsScheduling(true)}
                                className="p-4 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => onChange(null)}
                                className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!data && !isScheduling && (
                <div className="text-center py-10 bg-gray-50/30 rounded-[2rem] border border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold text-sm">No follow-up visit scheduled yet.</p>
                </div>
            )}
        </div>
    );
};
