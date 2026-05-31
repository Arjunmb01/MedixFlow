import React, { useState } from "react";
import { History, FileText, ChevronDown, ChevronUp, Pill } from "lucide-react";

interface PastVisit {
    id: string;
    completedAt: string;
    appointment: {
        appointmentDate: string;
        slotStart: string;
    };
    doctor: {
        firstName: string;
        lastName: string;
        specialization: { name: string } | null;
    };
    medicalRecord: {
        symptoms: string;
        diagnosis: string;
        notes: string | null;
    } | null;
    prescription: {
        instructions: string | null;
        medicines: Array<{
            id: string;
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
        }>;
    } | null;
    vitals: Array<{
        bloodPressure: string | null;
        heartRate: number | null;
        temperature: number | null;
        weight: number | null;
    }>;
}

interface PatientVisitHistoryProps {
    visits: PastVisit[];
}

export const PatientVisitHistory: React.FC<PatientVisitHistoryProps> = ({ visits }) => {
    const [expandedVisit, setExpandedVisit] = useState<string | null>(null);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
        });
    };

    return (
        <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-lg">
                <History className="w-5 h-5 text-amber-500" />
                Past Visit History
                {visits.length > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto">
                        {visits.length} visit{visits.length > 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {visits.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No previous visits recorded for this patient.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visits.map((visit) => (
                        <div key={visit.id} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all group hover:border-amber-200">
                            <button
                                onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                                className="w-full p-4 flex items-center justify-between text-left hover:bg-white transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        {formatDate(visit.appointment.appointmentDate)}
                                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-black">DR. {visit.doctor.lastName.toUpperCase()}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 font-medium italic">
                                        {visit.medicalRecord?.diagnosis || "No diagnosis recorded"}
                                    </p>
                                </div>
                                {expandedVisit === visit.id ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                            </button>
                            
                            {expandedVisit === visit.id && (
                                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 bg-white/50">
                                    {visit.medicalRecord && (
                                        <div className="pt-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Symptoms</p>
                                                    <p className="text-xs text-gray-700 leading-relaxed">{visit.medicalRecord.symptoms}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Diagnosis</p>
                                                    <p className="text-xs text-gray-900 font-bold">{visit.medicalRecord.diagnosis}</p>
                                                </div>
                                            </div>
                                            {visit.medicalRecord.notes && (
                                                <div className="mt-3 p-2 bg-amber-50/50 rounded-lg border border-amber-100/50">
                                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Clinical Notes</p>
                                                    <p className="text-xs text-gray-600 italic">{visit.medicalRecord.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {visit.vitals.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {visit.vitals[0].bloodPressure && (
                                                <span className="text-[10px] bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-700">BP: {visit.vitals[0].bloodPressure}</span>
                                            )}
                                            {visit.vitals[0].heartRate && (
                                                <span className="text-[10px] bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-700">HR: {visit.vitals[0].heartRate} bpm</span>
                                            )}
                                            {visit.vitals[0].temperature && (
                                                <span className="text-[10px] bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-700">TEMP: {visit.vitals[0].temperature}°F</span>
                                            )}
                                        </div>
                                    )}
                                    {visit.prescription && visit.prescription.medicines.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Pill className="w-3 h-3" /> Rx — PREVIOUS PRESCRIPTION
                                            </p>
                                            <div className="space-y-1">
                                                {visit.prescription.medicines.map((med, idx) => (
                                                    <div key={idx} className="text-[11px] text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm flex justify-between">
                                                        <span className="font-bold">{med.name}</span>
                                                        <span className="text-gray-400 font-medium">{med.dosage} • {med.frequency} • {med.duration}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
