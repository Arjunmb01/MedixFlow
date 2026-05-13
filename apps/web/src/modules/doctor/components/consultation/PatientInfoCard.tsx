import React from "react";

interface PatientInfoCardProps {
    patient: {
        firstName: string;
        lastName: string;
        phone: string;
        dob: string | null;
        gender: string | null;
        bloodGroup: string | null;
    } | null;
}

export const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient }) => {
    if (!patient) return null;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 mb-6 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                    {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">
                        {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Patient Profile</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="bg-white/50 rounded-xl p-2.5 border border-white">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Gender</p>
                    <p className="text-xs font-black text-gray-700">{patient.gender || "—"}</p>
                </div>
                <div className="bg-white/50 rounded-xl p-2.5 border border-white">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Blood Group</p>
                    <p className="text-xs font-black text-red-600">{patient.bloodGroup || "—"}</p>
                </div>
                <div className="bg-white/50 rounded-xl p-2.5 border border-white col-span-2">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Contact Number</p>
                    <p className="text-xs font-black text-gray-700">{patient.phone || "—"}</p>
                </div>
            </div>
        </div>
    );
};
