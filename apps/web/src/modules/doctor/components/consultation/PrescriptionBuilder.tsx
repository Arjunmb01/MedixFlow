import React, { useState, useEffect } from "react";
import { Pill, Sun, Cloud, Moon, Trash2, Plus, Info, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { scrollToTopSmooth } from "@/core/utils/browser";

interface Medicine {
    name: string;
    genericName?: string;
    dosage: string;
    frequency: string;
    morning: boolean;
    afternoon: boolean;
    night: boolean;
    duration: string;
    foodTiming: 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'EMPTY_STOMACH';
    instructions?: string;
    type: 'BRAND' | 'GENERIC';
}

interface PrescriptionBuilderProps {
    prescription: {
        instructions: string;
        medicines: Medicine[];
    };
    onChange: (prescription: any) => void;
    disabled?: boolean;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({ prescription, onChange, disabled }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [customMedicine, setCustomMedicine] = useState<Medicine>({
        name: "",
        genericName: "",
        dosage: "",
        frequency: "0-0-0",
        morning: false,
        afternoon: false,
        night: false,
        duration: "",
        foodTiming: 'AFTER_FOOD',
        instructions: "",
        type: 'BRAND'
    });

    // Auto-update frequency string based on morning/afternoon/night toggles
    useEffect(() => {
        const freq = `${customMedicine.morning ? 1 : 0}-${customMedicine.afternoon ? 1 : 0}-${customMedicine.night ? 1 : 0}`;
        if (freq !== customMedicine.frequency) {
            setCustomMedicine(prev => ({ ...prev, frequency: freq }));
        }
    }, [customMedicine.morning, customMedicine.afternoon, customMedicine.night]);

    const handleAddMedicine = () => {
        if (!customMedicine.name || !customMedicine.dosage) return;
        
        if (editingIndex !== null) {
            const updatedMedicines = [...prescription.medicines];
            updatedMedicines[editingIndex] = customMedicine;
            onChange({
                ...prescription,
                medicines: updatedMedicines,
            });
            setEditingIndex(null);
        } else {
            // Prevent duplicates
            const exists = prescription.medicines.find(m => m.name.toLowerCase() === customMedicine.name.toLowerCase());
            if (exists) {
                alert("This medicine is already in the prescription.");
                return;
            }

            onChange({
                ...prescription,
                medicines: [...prescription.medicines, customMedicine],
            });
        }
        
        setCustomMedicine({ 
            name: "", 
            genericName: "",
            dosage: "", 
            frequency: "0-0-0", 
            morning: false,
            afternoon: false,
            night: false,
            duration: "", 
            foodTiming: 'AFTER_FOOD',
            instructions: "",
            type: 'BRAND'
        });
    };

    const handleEditMedicine = (index: number) => {
        setCustomMedicine(prescription.medicines[index]);
        setEditingIndex(index);
        // Scroll to top of builder
        scrollToTopSmooth();
    };

    const handleRemoveMedicine = (index: number) => {
        if (editingIndex === index) setEditingIndex(null);
        onChange({
            ...prescription,
            medicines: prescription.medicines.filter((_, i) => i !== index),
        });
    };

    const handleHeaderChange = (value: string) => {
        onChange({ ...prescription, instructions: value });
    };

    const toggleDose = (period: 'morning' | 'afternoon' | 'night') => {
        setCustomMedicine(prev => ({ ...prev, [period]: !prev[period] }));
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl shadow-blue-50/50 mb-8 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/30 rounded-full -mr-32 -mt-32 blur-3xl -z-10"></div>
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center">
                        <Pill className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Prescription Builder</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Digital Rx Formulation</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Drug Interaction Guard Active</span>
                </div>
            </div>

            {!disabled && (
                <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 mb-10">
                    <div className="grid grid-cols-12 gap-6 items-end">
                        {/* Medicine Name & Search */}
                        <div className="col-span-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Medicine Name</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                <input 
                                    type="text" placeholder="Search drug database..."
                                    value={customMedicine.name} 
                                    onChange={(e) => setCustomMedicine({...customMedicine, name: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all placeholder:text-gray-300 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Medicine Type */}
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Type</label>
                            <select 
                                value={customMedicine.type}
                                onChange={(e) => setCustomMedicine({...customMedicine, type: e.target.value as any})}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-700 outline-none focus:border-teal-500 transition-all shadow-sm cursor-pointer"
                            >
                                <option value="BRAND">Brand Name</option>
                                <option value="GENERIC">Generic</option>
                            </select>
                        </div>

                        {/* Dosage */}
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Dosage</label>
                            <input 
                                type="text" placeholder="e.g. 500mg"
                                value={customMedicine.dosage} 
                                onChange={(e) => setCustomMedicine({...customMedicine, dosage: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:border-teal-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* Frequency Toggles */}
                        <div className="col-span-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1 text-center">Frequency (Dose Timing)</label>
                            <div className="flex gap-2 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                                <button 
                                    onClick={() => toggleDose('morning')}
                                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all ${customMedicine.morning ? 'bg-amber-50 text-amber-600' : 'text-gray-300 hover:bg-gray-50'}`}
                                >
                                    <Sun className="w-4 h-4 mb-1" />
                                    <span className="text-[9px] font-black">MORNING</span>
                                </button>
                                <button 
                                    onClick={() => toggleDose('afternoon')}
                                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all ${customMedicine.afternoon ? 'bg-blue-50 text-blue-600' : 'text-gray-300 hover:bg-gray-50'}`}
                                >
                                    <Cloud className="w-4 h-4 mb-1" />
                                    <span className="text-[9px] font-black">AFTERNOON</span>
                                </button>
                                <button 
                                    onClick={() => toggleDose('night')}
                                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all ${customMedicine.night ? 'bg-indigo-50 text-indigo-600' : 'text-gray-300 hover:bg-gray-50'}`}
                                >
                                    <Moon className="w-4 h-4 mb-1" />
                                    <span className="text-[9px] font-black">NIGHT</span>
                                </button>
                            </div>
                        </div>

                        {/* Food Timing */}
                        <div className="col-span-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Food Timing</label>
                            <div className="flex gap-2">
                                {(['BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD'] as const).map(timing => (
                                    <button
                                        key={timing}
                                        onClick={() => setCustomMedicine({...customMedicine, foodTiming: timing})}
                                        className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black transition-all border ${
                                            customMedicine.foodTiming === timing 
                                            ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-100' 
                                            : 'bg-white border-gray-200 text-gray-400 hover:border-teal-200'
                                        }`}
                                    >
                                        {timing.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Duration</label>
                            <input 
                                type="text" placeholder="e.g. 5 Days"
                                value={customMedicine.duration} 
                                onChange={(e) => setCustomMedicine({...customMedicine, duration: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:border-teal-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* Instructions */}
                        <div className="col-span-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Specific Instructions</label>
                            <input 
                                type="text" placeholder="Additional notes..."
                                value={customMedicine.instructions} 
                                onChange={(e) => setCustomMedicine({...customMedicine, instructions: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:border-teal-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* Add Button */}
                        <div className="col-span-2">
                            <button 
                                onClick={handleAddMedicine}
                                disabled={!customMedicine.name}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-teal-100 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {(editingIndex !== null ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                {editingIndex !== null ? 'Update Rx' : 'Add Rx'}
                            </button>
                            {editingIndex !== null && (
                                <button 
                                    onClick={() => {
                                        setEditingIndex(null);
                                        setCustomMedicine({ name: "", genericName: "", dosage: "", frequency: "0-0-0", morning: false, afternoon: false, night: false, duration: "", foodTiming: 'AFTER_FOOD', instructions: "", type: 'BRAND' });
                                    }}
                                    className="w-full mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Medicine List */}
            <div className="space-y-4">
                {prescription.medicines.length > 0 ? (
                    prescription.medicines.map((med, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl hover:shadow-blue-50/50 transition-all animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-6 flex-1">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${med.type === 'GENERIC' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                                    <Pill className={`w-6 h-6 ${med.type === 'GENERIC' ? 'text-orange-600' : 'text-blue-600'}`} />
                                </div>
                                <div className="grid grid-cols-4 flex-1 gap-4 items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-gray-900 text-lg leading-tight">{med.name}</h4>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${med.type === 'GENERIC' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {med.type}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-400 mt-0.5">{med.dosage}</p>
                                    </div>
                                    
                                    <div className="flex gap-1.5">
                                        <Sun className={`w-5 h-5 ${med.morning ? 'text-amber-500 drop-shadow-sm' : 'text-gray-100'}`} />
                                        <Cloud className={`w-5 h-5 ${med.afternoon ? 'text-blue-400 drop-shadow-sm' : 'text-gray-100'}`} />
                                        <Moon className={`w-5 h-5 ${med.night ? 'text-indigo-600 drop-shadow-sm' : 'text-gray-100'}`} />
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                                            {med.foodTiming?.replace('_', ' ') || "AFTER FOOD"}
                                        </span>
                                    </div>

                                    <div className="text-right pr-8">
                                        <p className="text-sm font-black text-gray-900">{med.duration}</p>
                                        {med.instructions && (
                                            <p className="text-[10px] font-bold text-gray-400 italic">"{med.instructions}"</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {!disabled && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                        onClick={() => handleEditMedicine(idx)}
                                        className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        title="Edit Medicine"
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleRemoveMedicine(idx)}
                                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Remove Medicine"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Info className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-black text-gray-300 uppercase tracking-widest">No Medicines Prescribed</h3>
                        <p className="text-gray-400 text-sm mt-2">Use the formulation tool above to add medications.</p>
                    </div>
                )}
            </div>

            {/* Global Instructions */}
            <div className="mt-12 bg-teal-50/50 p-8 rounded-[2rem] border border-teal-100/50">
                <label className="block text-[11px] font-black text-teal-700 uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Overall Pharmacy & Patient Instructions
                </label>
                <textarea 
                    placeholder="e.g. Continue physical therapy, avoid heavy lifting for 2 weeks..."
                    value={prescription.instructions} 
                    onChange={(e) => handleHeaderChange(e.target.value)}
                    disabled={disabled}
                    rows={2}
                    className="w-full bg-white border border-teal-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold text-gray-700 text-sm disabled:opacity-60 shadow-inner resize-none"
                />
            </div>
        </div>
    );
};
