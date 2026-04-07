import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { completeConsultation, getConsultationDetails, getPatientHistory } from "@/infrastructure/api/consultation.api";
import { getDoctorProfile } from "@/infrastructure/api/doctor.api";
import { Loader2, ArrowLeft, Save, FileText, Activity, Stethoscope, Pill, History, ChevronDown, ChevronUp, AlertTriangle, X, Check } from "lucide-react";
import DoctorSidebar from "../components/DoctorSidebar";
import DoctorTopNav from "../components/DoctorTopNav";

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
        specialization: { name: string };
    };
    medicalRecord: {
        symptoms: string;
        diagnosis: string;
        notes: string | null;
    } | null;
    prescription: {
        instructions: string | null;
        medicines: {
            id: string;
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
        }[];
    } | null;
    vitals: {
        bloodPressure: string | null;
        heartRate: number | null;
        temperature: number | null;
        weight: number | null;
    }[];
}

interface ConsultationDetails {
    id: string;
    patientId: string;
    doctorId: string;
    status: string;
    patient: {
        firstName: string;
        lastName: string;
        phone: string;
        dob: string | null;
        gender: string | null;
        bloodGroup: string | null;
    };
    appointment: {
        appointmentDate: string;
        slotStart: string;
    };
    vitals?: Array<{
        bloodPressure: string | null;
        heartRate: number | null;
        temperature: number | null;
        weight: number | null;
    }>;
    medicalRecord?: {
        symptoms: string;
        diagnosis: string;
        notes: string | null;
    } | null;
    prescription?: {
        instructions: string | null;
        medicines: Array<{
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
        }>;
    } | null;
}

export default function ConsultationWorkspace() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
    const [doctorProfile, setDoctorProfile] = useState<any>(null);
    const [pastVisits, setPastVisits] = useState<PastVisit[]>([]);
    const [expandedVisit, setExpandedVisit] = useState<string | null>(null);
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
    });

    const [prescription, setPrescription] = useState({
        instructions: "",
        medicines: [] as { name: string; dosage: string; frequency: string; duration: string }[],
    });

    const [customMedicine, setCustomMedicine] = useState({
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
    });

    useEffect(() => {
        if (id) fetchConsultation();
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const profile = await getDoctorProfile();
            setDoctorProfile(profile);
        } catch (error) {
            console.error("Failed to fetch doctor profile", error);
        }
    };

    const fetchConsultation = async () => {
        try {
            setIsLoadingDetails(true);
            const data = await getConsultationDetails(id!);
            setConsultation(data);
            // Once we have patient ID, load history
            if (data.patientId) {
                const history = await getPatientHistory(data.patientId);
                // Filter out current consultation from history
                setPastVisits(history.filter((h: PastVisit) => h.id !== id));
            }

            // Pre-populate form if data exists (e.g. for completed or resumed consultations)
            if (data.vitals && data.vitals.length > 0) {
                const latestVitals = data.vitals[0];
                setVitals({
                    bloodPressure: latestVitals.bloodPressure || "",
                    heartRate: latestVitals.heartRate?.toString() || "",
                    temperature: latestVitals.temperature?.toString() || "",
                    weight: latestVitals.weight?.toString() || "",
                });
            }
            if (data.medicalRecord) {
                setMedicalRecord({
                    symptoms: data.medicalRecord.symptoms || "",
                    diagnosis: data.medicalRecord.diagnosis || "",
                    notes: data.medicalRecord.notes || "",
                });
            }
            if (data.prescription) {
                setPrescription({
                    instructions: data.prescription.instructions || "",
                    medicines: data.prescription.medicines || [],
                });
            }
        } catch (error) {
            console.error("Failed to fetch consultation details", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleAddMedicine = () => {
        if (!customMedicine.name || !customMedicine.dosage) return;
        setPrescription((prev) => ({
            ...prev,
            medicines: [...prev.medicines, customMedicine],
        }));
        setCustomMedicine({ name: "", dosage: "", frequency: "", duration: "" });
    };

    const handleRemoveMedicine = (index: number) => {
        setPrescription((prev) => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index),
        }));
    };

    const handleRequestComplete = () => {
        if (!medicalRecord.symptoms || !medicalRecord.diagnosis) {
            alert("Symptoms and Diagnosis are required to complete a consultation.");
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmComplete = async () => {
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
                    symptoms: medicalRecord.symptoms,
                    diagnosis: medicalRecord.diagnosis,
                    notes: medicalRecord.notes || undefined,
                },
                prescription: {
                    instructions: prescription.instructions || undefined,
                    medicines: prescription.medicines,
                },
            };

            await completeConsultation(id, payload);
            navigate("/doctor/queue");
        } catch (error) {
            console.error("Failed to complete consultation", error);
            alert("Failed to save and complete consultation.");
        } finally {
            setIsSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    if (isLoadingDetails) {
        return (
            <div className="flex h-screen bg-gray-50">
                <DoctorSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DoctorTopNav 
                        doctorName={doctorProfile ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}` : "Loading..."}
                        doctorSpecialty={doctorProfile?.specialty}
                        avatarUrl={doctorProfile?.avatarUrl}
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Loading consultation workspace...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/doctor/queue")}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Consultation — {consultation?.patient.firstName} {consultation?.patient.lastName}
                        </h1>
                        <p className={`text-sm font-medium flex items-center gap-1.5 mt-0.5 ${consultation?.status === 'COMPLETED' ? 'text-blue-600' : 'text-green-600'}`}>
                            <span className={`w-2 h-2 rounded-full animate-pulse ${consultation?.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                            {consultation?.status === 'COMPLETED' ? 'Consultation Completed (Edit Mode)' : 'In Progress'}
                        </p>
                    </div>
                </div>
                <div>
                    <button 
                        onClick={handleRequestComplete}
                        disabled={isSubmitting}
                        className="bg-[#0066cc] hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-blue-200"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {consultation?.status === 'COMPLETED' ? 'Update Consultation' : 'Complete & Save EMR'}
                    </button>
                </div>
            </header>

            {/* Split Workspace */}
            <main className="flex-1 overflow-hidden flex">
                
                {/* Left Panel: Vitals & History */}
                <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto pl-8 pr-6 py-6">
                    {/* Patient Info Card */}
                    {consultation?.patient && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-100">
                            <h3 className="font-bold text-gray-900 text-lg mb-2">
                                {consultation.patient.firstName} {consultation.patient.lastName}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {consultation.patient.gender && (
                                    <span className="text-gray-600"><span className="font-bold text-gray-500">Gender:</span> {consultation.patient.gender}</span>
                                )}
                                {consultation.patient.bloodGroup && (
                                    <span className="text-gray-600"><span className="font-bold text-gray-500">Blood:</span> {consultation.patient.bloodGroup}</span>
                                )}
                                {consultation.patient.phone && (
                                    <span className="text-gray-600 col-span-2"><span className="font-bold text-gray-500">Phone:</span> {consultation.patient.phone}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Vitals Entry */}
                    <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Vitals Entry
                    </div>

                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Blood Pressure (mmHg)</label>
                            <input 
                                type="text" placeholder="e.g. 120/80"
                                value={vitals.bloodPressure} onChange={(e) => setVitals({...vitals, bloodPressure: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Heart Rate (bpm)</label>
                            <input 
                                type="number" placeholder="e.g. 75"
                                value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Temp (°F)</label>
                                <input 
                                    type="number" step="0.1" placeholder="98.6"
                                    value={vitals.temperature} onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Weight (kg)</label>
                                <input 
                                    type="number" step="0.1" placeholder="70"
                                    value={vitals.weight} onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Patient History Section */}
                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-lg">
                            <History className="w-5 h-5 text-amber-500" />
                            Past Visit History
                            {pastVisits.length > 0 && (
                                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto">
                                    {pastVisits.length} visit{pastVisits.length > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        {pastVisits.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 font-medium">No previous visits recorded for this patient.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pastVisits.map((visit) => (
                                    <div key={visit.id} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all">
                                        <button
                                            onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                                            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100/50 transition-colors"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {formatDate(visit.appointment.appointmentDate)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
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
                                            <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                                                {visit.medicalRecord && (
                                                    <div className="pt-3">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Symptoms</p>
                                                        <p className="text-sm text-gray-700">{visit.medicalRecord.symptoms}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">Diagnosis</p>
                                                        <p className="text-sm text-gray-900 font-semibold">{visit.medicalRecord.diagnosis}</p>
                                                        {visit.medicalRecord.notes && (
                                                            <>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">Notes</p>
                                                                <p className="text-sm text-gray-600 italic">{visit.medicalRecord.notes}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {visit.vitals.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {visit.vitals[0].bloodPressure && (
                                                            <span className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 font-medium">BP: {visit.vitals[0].bloodPressure}</span>
                                                        )}
                                                        {visit.vitals[0].heartRate && (
                                                            <span className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 font-medium">HR: {visit.vitals[0].heartRate} bpm</span>
                                                        )}
                                                        {visit.vitals[0].temperature && (
                                                            <span className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 font-medium">Temp: {visit.vitals[0].temperature}°F</span>
                                                        )}
                                                    </div>
                                                )}
                                                {visit.prescription && visit.prescription.medicines.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Rx — Previous Prescription</p>
                                                        <div className="space-y-1">
                                                            {visit.prescription.medicines.map((med) => (
                                                                <div key={med.id} className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">
                                                                    <span className="font-bold">{med.name}</span> — {med.dosage}, {med.frequency}, {med.duration}
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
                </div>

                {/* Right Panel: Clinical Assessment & Prescription */}
                <div className="w-2/3 bg-gray-50/50 overflow-y-auto px-8 py-6">
                    
                    {/* Medical Record */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
                            <Stethoscope className="w-5 h-5 text-purple-500" />
                            Clinical Assessment
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subjective Symptoms <span className="text-red-500">*</span></label>
                                <textarea 
                                    rows={3} placeholder="Patient complains of..."
                                    value={medicalRecord.symptoms} onChange={(e) => setMedicalRecord({...medicalRecord, symptoms: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Provisional Diagnosis <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" placeholder="e.g. Acute Viral Pharyngitis"
                                    value={medicalRecord.diagnosis} onChange={(e) => setMedicalRecord({...medicalRecord, diagnosis: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Clinical Notes & Advice</label>
                                <textarea 
                                    rows={2} placeholder="Additional observations, recommended tests or diet modifications..."
                                    value={medicalRecord.notes} onChange={(e) => setMedicalRecord({...medicalRecord, notes: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Digital Prescription */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
                            <Pill className="w-5 h-5 text-teal-500" />
                            Digital Prescription (Rx)
                        </div>

                        {/* Medicine Builder */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6 flex items-end gap-3">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Medicine Name</label>
                                <input 
                                    type="text" placeholder="e.g. Amoxicillin"
                                    value={customMedicine.name} onChange={(e) => setCustomMedicine({...customMedicine, name: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500 transition-all font-medium text-gray-900"
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dosage</label>
                                <input 
                                    type="text" placeholder="500mg"
                                    value={customMedicine.dosage} onChange={(e) => setCustomMedicine({...customMedicine, dosage: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500 transition-all"
                                />
                            </div>
                            <div className="w-28">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Frequency</label>
                                <input 
                                    type="text" placeholder="1-1-1"
                                    value={customMedicine.frequency} onChange={(e) => setCustomMedicine({...customMedicine, frequency: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500 transition-all"
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</label>
                                <input 
                                    type="text" placeholder="5 Days"
                                    value={customMedicine.duration} onChange={(e) => setCustomMedicine({...customMedicine, duration: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500 transition-all"
                                />
                            </div>
                            <button 
                                onClick={handleAddMedicine}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold text-sm h-[38px] transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        {/* Prescribed Items Table */}
                        {prescription.medicines.length > 0 && (
                            <div className="mb-6">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 rounded-lg">
                                        <tr>
                                            <th className="px-4 py-3 font-bold rounded-l-lg">Medicine</th>
                                            <th className="px-4 py-3 font-bold">Dosage</th>
                                            <th className="px-4 py-3 font-bold">Frequency</th>
                                            <th className="px-4 py-3 font-bold">Duration</th>
                                            <th className="px-4 py-3 font-bold text-right rounded-r-lg">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prescription.medicines.map((med, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-bold text-gray-900">{med.name}</td>
                                                <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
                                                <td className="px-4 py-3 text-gray-600 font-medium">{med.frequency}</td>
                                                <td className="px-4 py-3 text-gray-600">{med.duration}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleRemoveMedicine(idx)} className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors">
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pharmacy Instructions</label>
                            <input 
                                type="text" placeholder="E.g. Take medicines after food..."
                                value={prescription.instructions} onChange={(e) => setPrescription({...prescription, instructions: e.target.value})}
                                className="w-full bg-white border-b-2 border-dashed border-gray-200 py-2 outline-none focus:border-teal-500 transition-all text-gray-700 text-sm"
                            />
                        </div>

                    </div>
                </div>
            </main>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                                <AlertTriangle className="w-7 h-7 text-amber-600" />
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 mb-2">
                                {consultation?.status === "COMPLETED" ? "Update Consultation details?" : "Complete & Save Consultation?"}
                            </h2>
                            <p className="text-gray-500 font-medium mb-6">
                                {consultation?.status === "COMPLETED" 
                                    ? "This action will update the existing clinical record. Please review the changes before confirming."
                                    : "This action will finalize the EMR. Please review the summary below before confirming."}
                            </p>

                            {/* Summary */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Patient</span>
                                    <span className="text-gray-900 font-bold">{consultation?.patient.firstName} {consultation?.patient.lastName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Diagnosis</span>
                                    <span className="text-gray-900 font-bold">{medicalRecord.diagnosis || "—"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Vitals Recorded</span>
                                    <span className="text-gray-900 font-bold">
                                        {[vitals.bloodPressure, vitals.heartRate, vitals.temperature, vitals.weight].filter(Boolean).length} / 4
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Medicines Prescribed</span>
                                    <span className="text-gray-900 font-bold">{prescription.medicines.length} medicine{prescription.medicines.length !== 1 ? "s" : ""}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Go Back
                                </button>
                                <button
                                    onClick={handleConfirmComplete}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-[#0066cc] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2"
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
            )}
        </div>
    );
}
