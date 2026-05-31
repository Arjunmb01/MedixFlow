import React from "react";
import { Activity } from "lucide-react";

interface VitalsEntryProps {
    vitals: {
        bloodPressure: string;
        heartRate: string;
        temperature: string;
        weight: string;
    };
    onChange: (vitals: any) => void;
    disabled?: boolean;
}

export const VitalsEntry: React.FC<VitalsEntryProps> = ({ vitals, onChange, disabled }) => {
    const handleChange = (field: string, value: string) => {
        onChange({ ...vitals, [field]: value });
    };

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
                <Activity className="w-5 h-5 text-blue-500" />
                Vitals Entry
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Blood Pressure (mmHg)</label>
                    <input 
                        type="text" placeholder="e.g. 120/80"
                        value={vitals.bloodPressure} 
                        onChange={(e) => handleChange("bloodPressure", e.target.value)}
                        maxLength={20}
                        disabled={disabled}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Heart Rate (bpm)</label>
                    <input 
                        type="number" placeholder="e.g. 75"
                        value={vitals.heartRate} 
                        onChange={(e) => handleChange("heartRate", e.target.value)}
                        disabled={disabled}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Temp (°F)</label>
                        <input 
                            type="number" step="0.1" placeholder="98.6"
                            value={vitals.temperature} 
                            onChange={(e) => handleChange("temperature", e.target.value)}
                            disabled={disabled}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Weight (kg)</label>
                        <input 
                            type="number" step="0.1" placeholder="70"
                            value={vitals.weight} 
                            onChange={(e) => handleChange("weight", e.target.value)}
                            disabled={disabled}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
