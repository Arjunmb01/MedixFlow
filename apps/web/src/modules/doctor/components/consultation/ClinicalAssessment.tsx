import React from "react";
import { Stethoscope } from "lucide-react";

interface ClinicalAssessmentProps {
    medicalRecord: {
        symptoms: string;
        diagnosis: string;
        notes: string;
        planForManagement: string;
    };
    onChange: (record: any) => void;
    disabled?: boolean;
}

export const ClinicalAssessment: React.FC<ClinicalAssessmentProps> = ({ medicalRecord, onChange, disabled }) => {
    const handleChange = (field: string, value: string) => {
        onChange({ ...medicalRecord, [field]: value });
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
                <Stethoscope className="w-5 h-5 text-purple-500" />
                Clinical Assessment
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Subjective Symptoms <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                        rows={3} placeholder="Patient complains of..."
                        value={medicalRecord.symptoms} 
                        onChange={(e) => handleChange("symptoms", e.target.value)}
                        maxLength={2000}
                        disabled={disabled}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none font-medium disabled:opacity-60"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Clinical Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                        rows={2} placeholder="e.g. Acute Viral Pharyngitis"
                        value={medicalRecord.diagnosis} 
                        onChange={(e) => handleChange("diagnosis", e.target.value)}
                        maxLength={255}
                        disabled={disabled}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-gray-900 resize-none disabled:opacity-60"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plan for Management (Preventions)</label>
                        <textarea 
                            rows={3} placeholder="Steps for patient to take..."
                            value={medicalRecord.planForManagement} 
                            onChange={(e) => handleChange("planForManagement", e.target.value)}
                            maxLength={1000}
                            disabled={disabled}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none text-[13px] disabled:opacity-60"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Follow-up Recommendation</label>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-[13px] text-blue-700 font-medium h-[98px] flex items-center justify-center text-center italic">
                            Follow-up can be scheduled after completing this consultation.
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Clinical Notes (Optional)</label>
                    <textarea 
                        rows={2} placeholder="Internal observations..."
                        value={medicalRecord.notes} 
                        onChange={(e) => handleChange("notes", e.target.value)}
                        maxLength={2000}
                        disabled={disabled}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none text-[13px] disabled:opacity-60"
                    />
                </div>
            </div>
        </div>
    );
};
