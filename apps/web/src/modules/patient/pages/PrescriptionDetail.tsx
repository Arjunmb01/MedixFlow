import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNav from "../components/dashboard/TopNav";
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile";
import { getPatientAppointments } from "@/infrastructure/api/patient.api";
import {
    ArrowLeft,
    Loader2,
    Printer,
    Download,
    Heart,
    Stethoscope,
    Pill,
    ClipboardList,
    CalendarCheck,
} from "lucide-react";

interface Medicine {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface PrescriptionData {
    appointmentDate: string;
    slotStart: string;
    doctor: {
        firstName: string;
        lastName: string;
        specialization: { name: string } | null;
    };
    consultation: {
        id: string;
        vitals: {
            bloodPressure: string | null;
            heartRate: number | null;
            temperature: number | null;
            weight: number | null;
        }[];
        medicalRecord: {
            symptoms: string;
            diagnosis: string;
            notes: string | null;
        } | null;
        prescription: {
            id: string;
            instructions: string | null;
            medicines: Medicine[];
        } | null;
    };
}

export default function PrescriptionDetail() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { profile } = usePatientProfile();
    const printRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<PrescriptionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [appointmentId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const appointments = await getPatientAppointments();
            const apt = appointments.find((a: { id: string }) => a.id === appointmentId);
            if (apt && apt.consultation) {
                setData(apt);
            }
        } catch (error) {
            console.error("Failed to fetch prescription details:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        // Use browser print dialog with "Save as PDF"
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex font-outfit">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <TopNav userName={profile?.name || ""} patientId={profile?.patientId || ""} />
                    <div className="pt-28 flex justify-center items-center py-32">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                </div>
            </div>
        );
    }

    if (!data || !data.consultation?.prescription) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex font-outfit">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <TopNav userName={profile?.name || ""} patientId={profile?.patientId || ""} />
                    <div className="pt-28 flex flex-col justify-center items-center py-32">
                        <p className="text-gray-500 font-bold text-lg">Prescription not found.</p>
                        <button onClick={() => navigate("/patient/prescriptions")} className="mt-4 text-blue-600 font-bold hover:underline">
                            ← Back to Prescriptions
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const vitals = data.consultation.vitals?.[0];
    const record = data.consultation.medicalRecord;
    const rx = data.consultation.prescription;
    const prescriptionId = `RX-${new Date(data.appointmentDate).getFullYear()}-${rx.id.slice(0, 4).toUpperCase()}`;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-outfit">
            {/* Hide sidebar/nav in print */}
            <div className="print:hidden">
                <Sidebar />
            </div>

            <div className="flex-1 ml-64 print:ml-0">
                <div className="print:hidden">
                    <TopNav userName={profile?.name || ""} patientId={profile?.patientId || ""} />
                </div>

                <main className="pt-28 pb-12 px-8 max-w-4xl mx-auto print:pt-0 print:px-0 print:max-w-full">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between mb-6 print:hidden">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                        <div className="flex items-center gap-3">
                            <button onClick={handlePrint} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
                                <Printer className="w-4 h-4" />
                                Print Prescription
                            </button>
                            <button onClick={handleDownloadPDF} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200">
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Prescription Document */}
                    <div ref={printRef} className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden print:rounded-none print:border-0 print:shadow-none">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-8 text-white print:bg-white print:text-black print:border-b-2 print:border-blue-600">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight print:text-blue-700">MedixFlow Clinics</h1>
                                    <p className="text-blue-100 text-sm font-medium mt-1 print:text-gray-600">Central Health Hospital, Block B</p>
                                    <p className="text-blue-200 text-xs mt-0.5 print:text-gray-500">123 Medical Square, Silicon Valley, CA 94043</p>
                                    <p className="text-blue-200 text-xs print:text-gray-500">Contact: +1 (555) 001-2026</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black print:text-gray-900">Dr. {data.doctor.firstName} {data.doctor.lastName}</p>
                                    <p className="text-blue-100 text-sm font-medium print:text-gray-600">{data.doctor.specialization?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Patient Info Bar */}
                        <div className="px-10 py-5 border-b border-gray-100 bg-gray-50/50">
                            <div className="grid grid-cols-4 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Name</p>
                                    <p className="text-sm font-black text-gray-900 mt-0.5">{profile?.name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Age / Gender</p>
                                    <p className="text-sm font-black text-gray-900 mt-0.5">{profile?.gender || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                                    <p className="text-sm font-black text-gray-900 mt-0.5">{formatDate(data.appointmentDate)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prescription ID</p>
                                    <p className="text-sm font-black text-blue-600 mt-0.5">#{prescriptionId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 py-8 space-y-8">

                            {/* Vitals */}
                            {vitals && (
                                <section>
                                    <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        Vitals
                                    </h2>
                                    <div className="grid grid-cols-4 gap-4">
                                        {vitals.temperature && (
                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Temp</p>
                                                <p className="text-xl font-black text-gray-900 mt-1">{vitals.temperature} °F</p>
                                            </div>
                                        )}
                                        {vitals.bloodPressure && (
                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BP</p>
                                                <p className="text-xl font-black text-gray-900 mt-1">{vitals.bloodPressure}</p>
                                            </div>
                                        )}
                                        {vitals.heartRate && (
                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Heart Rate</p>
                                                <p className="text-xl font-black text-gray-900 mt-1">{vitals.heartRate} bpm</p>
                                            </div>
                                        )}
                                        {vitals.weight && (
                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight</p>
                                                <p className="text-xl font-black text-gray-900 mt-1">{vitals.weight} kg</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Symptoms & Diagnosis */}
                            {record && (
                                <section>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <Stethoscope className="w-4 h-4 text-amber-500" />
                                                Initial Symptoms
                                            </h2>
                                            <p className="text-sm text-gray-700 leading-relaxed">{record.symptoms}</p>
                                        </div>
                                        <div>
                                            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <Stethoscope className="w-4 h-4 text-orange-500" />
                                                Diagnosis
                                            </h2>
                                            <p className="text-sm font-bold text-gray-900">{record.diagnosis}</p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Treatment / Medications Table */}
                            <section>
                                <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Pill className="w-4 h-4 text-teal-500" />
                                    Treatment / Medications
                                </h2>
                                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="text-left px-6 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Medicine Name</th>
                                                <th className="text-left px-6 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Dosage</th>
                                                <th className="text-left px-6 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Frequency</th>
                                                <th className="text-left px-6 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rx.medicines.map((med, idx) => (
                                                <tr key={med.id} className={`${idx < rx.medicines.length - 1 ? "border-b border-gray-50" : ""} hover:bg-blue-50/30`}>
                                                    <td className="px-6 py-4">
                                                        <p className="font-black text-blue-700">{med.name}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 font-medium">{med.dosage}</td>
                                                    <td className="px-6 py-4 text-gray-700 font-medium">{med.frequency}</td>
                                                    <td className="px-6 py-4 text-gray-700 font-medium">{med.duration}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Notes & Follow-up */}
                            {record?.notes && (
                                <section>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <ClipboardList className="w-4 h-4 text-purple-500" />
                                                Plan for Management
                                            </h2>
                                            <p className="text-sm text-gray-700 leading-relaxed">{record.notes}</p>
                                        </div>
                                        <div>
                                            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <CalendarCheck className="w-4 h-4 text-green-500" />
                                                Follow-Up
                                            </h2>
                                            <p className="text-sm text-gray-700">
                                                {rx.instructions || "No specific follow-up instructions."}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Pharmacy Instructions */}
                            {rx.instructions && !record?.notes && (
                                <section>
                                    <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                        <ClipboardList className="w-4 h-4 text-purple-500" />
                                        Pharmacy Instructions
                                    </h2>
                                    <p className="text-sm text-gray-700 leading-relaxed">{rx.instructions}</p>
                                </section>
                            )}

                            {/* Doctor Signature */}
                            <div className="border-t border-gray-100 pt-6 mt-4 text-right">
                                <div className="inline-block text-center">
                                    <div className="w-48 border-b border-gray-300 mb-2"></div>
                                    <p className="text-sm font-black text-gray-900">Dr. {data.doctor.firstName} {data.doctor.lastName}</p>
                                    <p className="text-xs text-gray-500 font-medium">{data.doctor.specialization?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-10 py-4 text-center border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                This is a computer-generated prescription issued via MedixFlow Clinical Platform. No physical signature required.
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    .print\\:ml-0 { margin-left: 0 !important; }
                    .print\\:pt-0 { padding-top: 0 !important; }
                    .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
                    .print\\:max-w-full { max-width: 100% !important; }
                    .print\\:rounded-none { border-radius: 0 !important; }
                    .print\\:border-0 { border: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:bg-white { background-color: white !important; }
                    .print\\:text-black { color: black !important; }
                    .print\\:text-blue-700 { color: #1d4ed8 !important; }
                    .print\\:text-gray-600 { color: #4b5563 !important; }
                    .print\\:text-gray-500 { color: #6b7280 !important; }
                    .print\\:text-gray-900 { color: #111827 !important; }
                    .print\\:border-b-2 { border-bottom-width: 2px !important; }
                    .print\\:border-blue-600 { border-color: #2563eb !important; }
                }
            `}</style>
        </div>
    );
}
