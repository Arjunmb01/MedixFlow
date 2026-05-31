import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    completeConsultation, 
    getConsultationDetails, 
    getPatientHistory, 
    requestLabTests, 
    getLabTests,
    getConsultationDraft,
    generateConsultationPDF,
    scheduleFollowUp,
    reviewLabTest
} from "@/infrastructure/api/consultation.api";
import { 
    Loader2, ArrowLeft, Save, CloudCheck, CloudUpload, FileDown, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

import DoctorSidebar from "../components/DoctorSidebar";

// Refactored Components
import { VitalsEntry } from "../components/consultation/VitalsEntry";
import { ClinicalAssessment } from "../components/consultation/ClinicalAssessment";
import { PrescriptionBuilder } from "../components/consultation/PrescriptionBuilder";
import { LabTestManager } from "../components/consultation/LabTestManager";
import { PatientVisitHistory } from "../components/consultation/PatientVisitHistory";
import { PatientInfoCard } from "../components/consultation/PatientInfoCard";
import { ConsultationSummaryModal } from "../components/consultation/ConsultationSummaryModal";
import { FollowUpScheduler } from "../components/consultation/FollowUpScheduler";

// Custom Hook
import { useConsultationAutoSave } from "../hooks/useConsultationAutoSave";

export default function ConsultationWorkspace() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [consultation, setConsultation] = useState<any | null>(null);
    const [pastVisits, setPastVisits] = useState<any[]>([]);
    const [labTests, setLabTests] = useState<any[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Form States
    const [vitals, setVitals] = useState({
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        weight: "",
    });

    const [medicalRecord, setMedicalRecord] = useState({
        symptoms: "",
        diagnosis: "",
        notes: "",
        planForManagement: "",
    });

    const [prescription, setPrescription] = useState({
        instructions: "",
        medicines: [] as any[],
    });
    const [followUp, setFollowUp] = useState<any | null>(null);

    // Unified Form State for Auto-save
    const formData = useMemo(() => ({
        vitals,
        medicalRecord,
        prescription
    }), [vitals, medicalRecord, prescription]);

    const { isSaving, lastSaved } = useConsultationAutoSave(
        id, 
        formData, 
        isLoadingDetails || consultation?.status === "COMPLETED"
    );

    useEffect(() => {
        if (id) fetchInitialData();
    }, [id]);


    const fetchInitialData = async () => {
        if (!id) return;
        try {
            setIsLoadingDetails(true);
            
            // 1. Fetch Draft First
            const draft = await getConsultationDraft(id);

            // 2. Fetch Consultation Details
            const data = await getConsultationDetails(id);
            if (!data) {
                toast.error("Consultation record not found");
                navigate("/doctor/queue");
                return;
            }
            setConsultation(data);

            // 3. Load History
            if (data.patientId) {
                const history = await getPatientHistory(data.patientId);
                setPastVisits(history.filter((h: any) => h.id !== id));
            }

            // 4. Fetch Lab Tests
            const tests = await getLabTests(id, "doctor");
            setLabTests(tests);

            // 5. Populate Form (Draft takes priority over actual record, unless it's already completed)
            const isCompleted = data.status === "COMPLETED";
            const hasDraftData = !isCompleted && draft && (draft.vitals || draft.medicalRecord || draft.prescription);
            
            if (hasDraftData) {
                toast.success("Resumed from auto-saved draft");
                if (draft.vitals) setVitals(draft.vitals);
                if (draft.medicalRecord) setMedicalRecord(draft.medicalRecord);
                if (draft.prescription) setPrescription(draft.prescription);
            } else {
                // Populate from record if it's completed/started
                if (data.vitals && data.vitals.length > 0) {
                    const latest = data.vitals[0];
                    setVitals({
                        bloodPressure: latest.bloodPressure || "",
                        heartRate: latest.heartRate?.toString() || "",
                        temperature: latest.temperature?.toString() || "",
                        weight: latest.weight?.toString() || "",
                    });
                }
                if (data.medicalRecord) {
                    setMedicalRecord({
                        symptoms: data.medicalRecord.symptoms || "",
                        diagnosis: data.medicalRecord.diagnosis || "",
                        notes: data.medicalRecord.notes || "",
                        planForManagement: data.medicalRecord.planForManagement || "",
                    });
                }
                if (data.prescription) {
                    setPrescription({
                        instructions: data.prescription.instructions || "",
                        medicines: data.prescription.medicines || [],
                    });
                }
                if (data.followUp) {
                    setFollowUp(data.followUp);
                }
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load workspace data");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleLabRequest = async (testName: string, urgency: string, fastingRequired: boolean) => {
        if (!id) return;
        try {
            await requestLabTests(id, [{ testName, urgency, fastingRequired }]);
            const tests = await getLabTests(id, "doctor");
            setLabTests(tests);
            toast.success(`Lab test "${testName}" requested.`);
        } catch (error) {
            toast.error("Failed to request lab test.");
        }
    };

    const handleLabReview = async (labTestId: string, comments: string, isAbnormal: boolean) => {
        if (!id) return;
        try {
            await reviewLabTest(id, labTestId, comments, isAbnormal);
            const tests = await getLabTests(id, "doctor");
            setLabTests(tests);
            toast.success("Lab test reviewed successfully.");
        } catch (error) {
            toast.error("Failed to review lab test.");
        }
    };


    const handleComplete = async () => {
        if (!medicalRecord.symptoms || !medicalRecord.diagnosis) {
            toast.error("Symptoms and Diagnosis are mandatory.");
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmComplete = async () => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            const payload = {
                vitals: {
                    bloodPressure: vitals.bloodPressure || undefined,
                    heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : undefined,
                    temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
                    weight: vitals.weight ? parseFloat(vitals.weight) : undefined,
                },
                medicalRecord: {
                    ...medicalRecord,
                    notes: medicalRecord.notes || undefined,
                    planForManagement: medicalRecord.planForManagement || undefined,
                },
                prescription: {
                    instructions: prescription.instructions || undefined,
                    medicines: prescription.medicines,
                },
                followUp: followUp ? {
                    ...followUp,
                    scheduledDate: new Date(followUp.scheduledDate).toISOString(),
                } : undefined
            };

            // 1. Complete Consultation
            await completeConsultation(id, payload);

            // 2. Schedule Follow-up if exists
            if (followUp && !consultation.followUp) {
                await scheduleFollowUp({
                    consultationId: id,
                    patientId: consultation.patientId,
                    doctorId: consultation.doctorId,
                    ...followUp
                });
            }
            toast.success("Consultation completed successfully");
            
            // Trigger auto-download of the report
            handleExportPDF();
            
            // Stay on page to show completed state, or navigate after a delay
            setTimeout(() => {
                navigate("/doctor/queue");
            }, 3000);
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to complete consultation.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    const handleExportPDF = async () => {
        if (!id) return;
        try {
            const response = await generateConsultationPDF(id, "doctor");
            
            if (response.pdfUrl) {
                const link = document.createElement("a");
                link.href = response.pdfUrl;
                link.download = `ClinicalReport-${id.slice(0, 8)}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Clinical Report downloaded successfully");
            } else {
                toast.error("Failed to generate PDF URL.");
            }
        } catch (error) {
            toast.error("Failed to generate PDF.");
        }
    };

    if (isLoadingDetails) {
        return (
            <div className="flex h-screen bg-gray-50">
                <DoctorSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Workspace...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isLoadingDetails && !consultation) {
        return (
            <div className="flex h-screen bg-gray-50">
                <DoctorSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="max-w-md w-full text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Consultation Not Found</h2>
                            <p className="text-gray-500 font-medium mb-10 text-lg leading-relaxed">
                                We couldn't retrieve the details for this consultation. It may have been completed, cancelled, or you may not have permission to view it.
                            </p>
                            <button 
                                onClick={() => navigate("/doctor/queue")}
                                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200 flex items-center justify-center gap-3"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Return to Patient Queue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm z-20">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate("/doctor/queue")}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-500 hover:text-gray-900 border border-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                Workspace
                            </h1>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            <p className="text-gray-500 font-bold text-lg">
                                Consultation with {consultation?.patient?.firstName} {consultation?.patient?.lastName}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${consultation?.status === 'COMPLETED' ? 'text-blue-600' : 'text-green-600'}`}>
                                <span className={`w-2 h-2 rounded-full ${consultation?.status === 'COMPLETED' ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></span>
                                {consultation?.status === 'COMPLETED' ? 'Record Completed' : 'Live Consultation Session'}
                            </p>
                            
                            {/* Auto-save Status Indicator */}
                            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                                {isSaving ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                        <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
                                        Syncing...
                                    </div>
                                ) : consultation?.status === "COMPLETED" ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Manual Update Mode
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <CloudCheck className="w-3.5 h-3.5" />
                                        {lastSaved ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Saved to cloud"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {consultation?.status === "COMPLETED" && (
                        <button 
                            onClick={handleExportPDF}
                            className="bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-600 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
                        >
                            <FileDown className="w-4 h-4" />
                            EMR Report
                        </button>
                    )}
                    <button 
                        onClick={handleComplete}
                        disabled={isSubmitting}
                        className="bg-[#0066cc] hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all disabled:opacity-70 shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {consultation?.status === 'COMPLETED' ? 'Update & Commit' : 'Finalize & Save'}
                    </button>
                </div>
            </header>

            {/* Split Workspace */}
            <main className="flex-1 overflow-hidden flex">
                
                {/* Left Panel: Vitals & History */}
                <div className="w-[32%] border-r border-gray-200 bg-white overflow-y-auto px-8 py-8 custom-scrollbar">
                    <PatientInfoCard patient={consultation?.patient || null} />
                    
                    <VitalsEntry 
                        vitals={vitals} 
                        onChange={setVitals} 
                        disabled={consultation?.status === 'COMPLETED' && false} // Allow editing in completed mode for now as per "update" logic
                    />

                    <PatientVisitHistory visits={pastVisits} />
                </div>

                {/* Right Panel: Clinical Assessment & Prescription */}
                <div className="flex-1 bg-gray-50/30 overflow-y-auto px-10 py-8 custom-scrollbar">
                    
                    <ClinicalAssessment 
                        medicalRecord={medicalRecord} 
                        onChange={setMedicalRecord} 
                    />

                    <LabTestManager 
                        labTests={labTests} 
                        onRequest={handleLabRequest} 
                        onReview={handleLabReview}
                    />

                    <PrescriptionBuilder 
                        prescription={prescription} 
                        onChange={setPrescription} 
                    />

                    <FollowUpScheduler 
                        data={followUp} 
                        onChange={setFollowUp}
                        disabled={consultation?.status === 'COMPLETED' && !!consultation?.followUp}
                    />
                </div>
            </main>

            {/* Modals */}
            <ConsultationSummaryModal 
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmComplete}
                isSubmitting={isSubmitting}
                consultation={consultation}
                medicalRecord={medicalRecord}
                vitals={vitals}
                prescription={prescription}
            />
        </div>
    );
}
