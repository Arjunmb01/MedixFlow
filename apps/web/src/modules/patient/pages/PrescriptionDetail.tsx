import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNav from "../components/dashboard/TopNav";
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile";
import { getPatientAppointments } from "@/infrastructure/api/patient.api";
import { getLabTests, uploadLabTest } from "@/infrastructure/api/consultation.api";
import { pdf } from '@react-pdf/renderer';
import PrescriptionPDF from "../components/prescription/PrescriptionPDF";
import { toast } from "sonner";
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
    FlaskConical,
    Upload,
    FileText as FilePdf,
    ExternalLink,
} from "lucide-react";

// Standard HEX colors to satisfy html2canvas parser (doesn't support oklch)
const COLORS = {
    blue600: "#2563eb",
    blue700: "#1d4ed8",
    blue100: "#dbeafe",
    blue200: "#bfdbfe",
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#374151",
    gray900: "#111827",
    red500: "#ef4444",
    amber500: "#f59e0b",
    orange500: "#f97316",
    teal500: "#14b8a6",
    purple500: "#a855f7",
    green500: "#22c55e",
};

interface Medicine {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string | null;
}

interface LabTest {
    id: string;
    consultationId: string;
    testName: string;
    status: string;
    reportUrl: string | null;
    createdAt: string;
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
            planForManagement: string | null;
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
    const [searchParams] = useSearchParams();
    const { profile } = usePatientProfile();
    const printRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<PrescriptionData | null>(null);
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingTestId, setUploadingTestId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [appointmentId]);

    useEffect(() => {
        if (!loading && data && searchParams.get("download") === "true") {
            const triggerAutoDownload = async () => {
                try {
                    setIsDownloading(true);
                    const rx = data.consultation.prescription!;
                    const prescriptionId = `RX-${new Date(data.appointmentDate).getFullYear()}-${rx.id.slice(0, 4).toUpperCase()}`;
                    
                    const blob = await pdf(
                        <PrescriptionPDF 
                            data={data} 
                            profile={profile} 
                            prescriptionId={prescriptionId} 
                        />
                    ).toBlob();
                    
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Prescription-${prescriptionId}.pdf`;
                    link.click();
                    URL.revokeObjectURL(url);
                    toast.success("Prescription downloaded successfully");
                } catch (error) {
                    console.error("Auto-download failed:", error);
                } finally {
                    setIsDownloading(false);
                }
            };
            
            triggerAutoDownload();
        }
    }, [loading, data, searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const appointments = await getPatientAppointments();
            const apt = appointments.find((a: { id: string }) => a.id === appointmentId);
            if (apt && apt.consultation) {
                setData(apt);
                
                // Fetch lab tests for this consultation
                const tests = await getLabTests(apt.consultation.id, "patient");
                setLabTests(tests);
            }
        } catch (error) {
            console.error("Failed to fetch prescription details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (labTestId: string, file: File) => {
        if (!file || !data) return;

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG, and PDF files are allowed.");
            return;
        }

        try {
            setUploadingTestId(labTestId);
            
            // 1. Upload to Cloudinary (Need to implement or use existing service)
            // For now, I'll simulate the upload process logic 
            // but in a real app, you'd send to an upload endpoint first.
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dck5be4et';
            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();
            
            if (uploadData.secure_url) {
                // 2. Save URL to backend
                await uploadLabTest(data.consultation.id, labTestId, uploadData.secure_url);
                toast.success("Report uploaded successfully!");
                
                // 3. Refresh lab tests
                const tests = await getLabTests(data.consultation.id, "patient");
                setLabTests(tests);
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("File upload failed:", error);
            toast.error("Failed to upload report. Please try again.");
        } finally {
            setUploadingTestId(null);
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

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        if (!data || !data.consultation.prescription) return;
        
        try {
            setIsDownloading(true);
            const rx = data.consultation.prescription!;
            const prescriptionId = `RX-${new Date(data.appointmentDate).getFullYear()}-${rx.id.slice(0, 4).toUpperCase()}`;
            
            const blob = await pdf(
                <PrescriptionPDF 
                    data={data} 
                    profile={profile} 
                    prescriptionId={prescriptionId} 
                />
            ).toBlob();
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Prescription-${prescriptionId}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Prescription downloaded successfully");
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to generate PDF. Please try printing instead.");
        } finally {
            setIsDownloading(false);
        }
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
                        <button onClick={() => navigate("/prescriptions")} className="mt-4 text-blue-600 font-bold hover:underline">
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
                             <button 
                                onClick={handleDownloadPDF} 
                                disabled={isDownloading}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                             >
                                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {isDownloading ? "Generating..." : "Download PDF"}
                            </button>
                        </div>
                    </div>

                    {/* Prescription Document */}
                    <div ref={printRef} className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden print:rounded-none print:border-0 print:shadow-none">

                        {/* Header */}
                        <div 
                            style={{ backgroundColor: COLORS.blue600 }}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-8 text-white print:bg-white print:text-black print:border-b-2 print:border-blue-600"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 style={{ color: "white" }} className="text-2xl font-black tracking-tight print:text-blue-700">MedixFlow Clinics</h1>
                                    <p style={{ color: COLORS.blue100 }} className="text-blue-100 text-sm font-medium mt-1 print:text-gray-600">Central Health Hospital, Block B</p>
                                    <p style={{ color: COLORS.blue200 }} className="text-blue-200 text-xs mt-0.5 print:text-gray-500">123 Medical Square, Silicon Valley, CA 94043</p>
                                    <p style={{ color: COLORS.blue200 }} className="text-blue-200 text-xs print:text-gray-500">Contact: +1 (555) 001-2026</p>
                                </div>
                                <div className="text-right">
                                    <p style={{ color: "white" }} className="text-lg font-black print:text-gray-900">Dr. {data.doctor.firstName} {data.doctor.lastName}</p>
                                    <p style={{ color: COLORS.blue100 }} className="text-blue-100 text-sm font-medium print:text-gray-600">{data.doctor.specialization?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Patient Info Bar */}
                        <div style={{ backgroundColor: COLORS.gray50, borderColor: COLORS.gray100 }} className="px-10 py-5 border-b border-gray-100 bg-gray-50/50">
                            <div className="grid grid-cols-4 gap-6">
                                <div>
                                    <p style={{ color: COLORS.gray400 }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Name</p>
                                    <p style={{ color: COLORS.gray900 }} className="text-sm font-black text-gray-900 mt-0.5">{profile?.name || "—"}</p>
                                </div>
                                <div>
                                    <p style={{ color: COLORS.gray400 }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Age / Gender</p>
                                    <p style={{ color: COLORS.gray900 }} className="text-sm font-black text-gray-900 mt-0.5">{profile?.gender || "—"}</p>
                                </div>
                                <div>
                                    <p style={{ color: COLORS.gray400 }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                                    <p style={{ color: COLORS.gray900 }} className="text-sm font-black text-gray-900 mt-0.5">{formatDate(data.appointmentDate)}</p>
                                </div>
                                <div>
                                    <p style={{ color: COLORS.gray400 }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prescription ID</p>
                                    <p style={{ color: COLORS.blue600 }} className="text-sm font-black text-blue-600 mt-0.5">#{prescriptionId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 py-8 space-y-8">

                            {/* Vitals */}
                            {vitals && (
                                <section>
                                    <h2 style={{ color: COLORS.gray900 }} className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                        <Heart style={{ color: COLORS.red500 }} className="w-4 h-4 text-red-500" />
                                        Vitals
                                    </h2>
                                    <div className="grid grid-cols-4 gap-4">
                                        {vitals.temperature && (
                                            <div style={{ backgroundColor: COLORS.gray50, borderColor: COLORS.gray100 }} className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                                                <p style={{ color: COLORS.gray400 }} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Temp</p>
                                                <p style={{ color: COLORS.gray900 }} className="text-xl font-black text-gray-900 mt-1">{vitals.temperature} °F</p>
                                            </div>
                                        )}
                                        {vitals.bloodPressure && (
                                            <div style={{ backgroundColor: COLORS.gray50, borderColor: COLORS.gray100 }} className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                                                <p style={{ color: COLORS.gray400 }} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BP</p>
                                                <p style={{ color: COLORS.gray900 }} className="text-xl font-black text-gray-900 mt-1">{vitals.bloodPressure}</p>
                                            </div>
                                        )}
                                        {vitals.heartRate && (
                                            <div style={{ backgroundColor: COLORS.gray50, borderColor: COLORS.gray100 }} className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                                                <p style={{ color: COLORS.gray400 }} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Heart Rate</p>
                                                <p style={{ color: COLORS.gray900 }} className="text-xl font-black text-gray-900 mt-1">{vitals.heartRate} bpm</p>
                                            </div>
                                        )}
                                        {vitals.weight && (
                                            <div style={{ backgroundColor: COLORS.gray50, borderColor: COLORS.gray100 }} className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
                                                <p style={{ color: COLORS.gray400 }} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight</p>
                                                <p style={{ color: COLORS.gray900 }} className="text-xl font-black text-gray-900 mt-1">{vitals.weight} kg</p>
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
                                            <h2 style={{ color: COLORS.gray900 }} className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <Stethoscope style={{ color: COLORS.amber500 }} className="w-4 h-4 text-amber-500" />
                                                Reported Symptoms
                                            </h2>
                                            <p style={{ color: COLORS.gray700 }} className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{record.symptoms}</p>
                                        </div>
                                        <div>
                                            <h2 style={{ color: COLORS.gray900 }} className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <Stethoscope style={{ color: COLORS.orange500 }} className="w-4 h-4 text-orange-500" />
                                                Clinical Diagnosis
                                            </h2>
                                            <p style={{ color: COLORS.gray900 }} className="text-sm font-bold text-gray-900 whitespace-pre-wrap">{record.diagnosis}</p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Treatment / Medications Table */}
                            <section>
                                <h2 style={{ color: COLORS.gray900 }} className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Pill style={{ color: COLORS.teal500 }} className="w-4 h-4 text-teal-500" />
                                    Treatment / Medications
                                </h2>
                                <div style={{ borderColor: COLORS.gray100 }} className="border border-gray-100 rounded-2xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr style={{ backgroundColor: COLORS.gray50, borderBottomColor: COLORS.gray100 }} className="bg-gray-50 border-b border-gray-100">
                                                <th style={{ color: COLORS.gray500 }} className="text-left px-6 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Medicine Name</th>
                                                <th style={{ color: COLORS.gray500 }} className="text-left px-6 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Dosage / Freq</th>
                                                <th style={{ color: COLORS.gray500 }} className="text-left px-6 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Duration</th>
                                                <th style={{ color: COLORS.gray500 }} className="text-left px-6 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Instructions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rx.medicines.map((med, idx) => (
                                                <tr key={med.id || idx} style={{ borderBottomColor: COLORS.gray50 }} className={`${idx < rx.medicines.length - 1 ? "border-b border-gray-50" : ""} hover:bg-blue-50/30`}>
                                                    <td className="px-6 py-4">
                                                        <p style={{ color: COLORS.blue700 }} className="font-black text-blue-700">{med.name}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p style={{ color: COLORS.gray900 }} className="text-sm font-bold text-gray-900">{med.dosage}</p>
                                                        <p style={{ color: COLORS.gray500 }} className="text-[10px] font-bold text-gray-500 uppercase">{med.frequency}</p>
                                                    </td>
                                                    <td style={{ color: COLORS.gray700 }} className="px-6 py-4 text-gray-700 font-medium">{med.duration}</td>
                                                    <td style={{ color: COLORS.gray700 }} className="px-6 py-4 text-gray-700 text-xs italic">{med.instructions || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Lab Test Requests (Patient Actionable) */}
                            {labTests.length > 0 && (
                                <section className="print:hidden">
                                     <h2 style={{ color: COLORS.gray900 }} className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                        <FlaskConical style={{ color: COLORS.orange500 }} className="w-4 h-4 text-orange-500" />
                                        Lab Test Requests
                                    </h2>
                                    <div className="grid grid-cols-1 gap-3">
                                        {labTests.map((test) => (
                                            <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${test.status === 'UPLOADED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        {test.status === 'UPLOADED' ? <FilePdf className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{test.testName}</p>
                                                        <p className="text-xs text-gray-500 font-medium tracking-tight">Status: <span className={test.status === 'UPLOADED' ? 'text-green-600' : 'text-orange-600'}>{test.status}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {test.reportUrl && (
                                                        <a 
                                                            href={test.reportUrl} target="_blank" rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-all"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            View Report
                                                        </a>
                                                    )}
                                                    <label className={`cursor-pointer px-4 py-2 border rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                                                        uploadingTestId === test.id 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                                    }`}>
                                                        {uploadingTestId === test.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                        {test.status === 'UPLOADED' ? "Update Report" : "Upload Result"}
                                                        <input 
                                                            type="file" className="hidden" 
                                                            disabled={uploadingTestId === test.id}
                                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(test.id, e.target.files[0])} 
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Notes & Follow-up */}
                            {record?.notes && (
                                <section>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h2 style={{ color: COLORS.gray900 }} className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <ClipboardList style={{ color: COLORS.purple500 }} className="w-4 h-4 text-purple-500" />
                                                Management Plan
                                            </h2>
                                            <p style={{ color: COLORS.gray700 }} className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {record.planForManagement || "Patient is advised to take rest and follow general precautions."}
                                            </p>
                                        </div>
                                        <div>
                                            <h2 style={{ color: COLORS.gray900 }} className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <CalendarCheck style={{ color: COLORS.green500 }} className="w-4 h-4 text-green-500" />
                                                Follow-Up Advice
                                            </h2>
                                            <p style={{ color: COLORS.gray700 }} className="text-sm text-gray-700">
                                                {rx.instructions || "No specific follow-up specified by the doctor."}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {record.notes && (
                                        <div className="mt-8 pt-8 border-t border-gray-50">
                                            <h2 style={{ color: COLORS.gray900 }} className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <ClipboardList style={{ color: COLORS.blue600 }} className="w-4 h-4 text-blue-600" />
                                                Additional Doctor Observations
                                            </h2>
                                            <p style={{ color: COLORS.gray700 }} className="text-sm text-gray-700 leading-relaxed italic">{record.notes}</p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Pharmacy Instructions */}
                            {rx.instructions && !record?.notes && (
                                <section>
                                    <h2 style={{ color: COLORS.gray900 }} className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                        <ClipboardList style={{ color: COLORS.purple500 }} className="w-4 h-4 text-purple-500" />
                                        Pharmacy Instructions
                                    </h2>
                                    <p style={{ color: COLORS.gray700 }} className="text-sm text-gray-700 leading-relaxed">{rx.instructions}</p>
                                </section>
                            )}

                            {/* Doctor Signature */}
                            <div style={{ borderTopColor: COLORS.gray100 }} className="border-t border-gray-100 pt-6 mt-4 text-right">
                                <div className="inline-block text-center">
                                    <div style={{ borderBottomColor: COLORS.gray200 }} className="w-48 border-b border-gray-300 mb-2"></div>
                                    <p style={{ color: COLORS.gray900 }} className="text-sm font-black text-gray-900">Dr. {data.doctor.firstName} {data.doctor.lastName}</p>
                                    <p style={{ color: COLORS.gray500 }} className="text-xs text-gray-500 font-medium">{data.doctor.specialization?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ backgroundColor: COLORS.gray50, borderTopColor: COLORS.gray100 }} className="bg-gray-50 px-10 py-4 text-center border-t border-gray-100">
                            <p style={{ color: COLORS.gray400 }} className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                This is a computer-generated prescription issued via MedixFlow Clinical Platform. No physical signature required.
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:ml-0 { margin-left: 0 !important; }
                    .print\\:pt-0 { padding-top: 0 !important; }
                    .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
                    .print\\:max-w-full { max-width: 100% !important; }
                    .print\\:rounded-none { border-radius: 0 !important; }
                    .print\\:border-0 { border: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:bg-white { background-color: #ffffff !important; }
                    .print\\:text-black { color: #000000 !important; }
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
