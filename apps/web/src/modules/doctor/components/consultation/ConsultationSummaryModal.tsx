import React from "react";
import { AlertTriangle, X, Check, Loader2 } from "lucide-react";

interface ConsultationSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    consultation: any;
    medicalRecord: any;
    vitals: any;
    prescription: any;
}

export const ConsultationSummaryModal: React.FC<ConsultationSummaryModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting,
    consultation,
    medicalRecord,
    vitals,
    prescription
}) => {
    if (!isOpen) return null;

    const vitalsCount = [vitals.bloodPressure, vitals.heartRate, vitals.temperature, vitals.weight].filter(Boolean).length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                        <AlertTriangle className="w-7 h-7 text-amber-600" />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                        {consultation?.status === "COMPLETED" ? "Update Consultation Details?" : "Complete & Save Consultation?"}
                    </h2>
                    <p className="text-gray-500 font-medium mb-6 text-sm">
                        {consultation?.status === "COMPLETED" 
                            ? "This action will update the existing clinical record and create an audit revision. Please review the changes."
                            : "This action will finalize the EMR and notify the patient. Please review the summary below."}
                    </p>

                    {/* Summary Card */}
                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4 mb-8 shadow-inner">
                        <div className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-3">
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Patient</span>
                            <span className="text-gray-900 font-black">{consultation?.patient.firstName} {consultation?.patient.lastName}</span>
                        </div>
                        <div className="flex justify-between items-start text-sm border-b border-gray-200/50 pb-3">
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Diagnosis</span>
                            <span className="text-gray-900 font-black text-right max-w-[200px] leading-tight">{medicalRecord.diagnosis || "—"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-3">
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Vitals Recorded</span>
                            <span className={`font-black ${vitalsCount === 4 ? 'text-green-600' : 'text-amber-600'}`}>
                                {vitalsCount} / 4
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Medicines (Rx)</span>
                            <span className="text-gray-900 font-black">{prescription.medicines.length} item{prescription.medicines.length !== 1 ? "s" : ""}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Go Back
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-[#0066cc] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {consultation?.status === "COMPLETED" ? "Confirm & Update" : "Confirm & Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
