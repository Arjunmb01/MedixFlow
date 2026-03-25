import { useState, useEffect } from "react";
import DoctorSidebar from "../components/DoctorSidebar";
import DoctorTopNav from "../components/DoctorTopNav";
import { getDoctorPrescriptionsList, updateDoctorPrescription } from "@/infrastructure/api/doctor.api";
import { useDoctorDashboard } from "@/application/doctor/hooks/useDoctorDashboard";
import { Search, Loader2, FileText, Pill, Calendar, Eye, User, Edit2, Plus, Trash2, Save, X } from "lucide-react";

interface Medicine {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface PrescriptionAppointment {
    id: string;
    appointmentDate: string;
    slotStart: string;
    patient: {
        firstName: string;
        lastName: string;
        phone: string;
        gender: string;
    };
    consultation: {
        id: string;
        medicalRecord: {
            diagnosis: string;
            symptoms: string;
        } | null;
        prescription: {
            id: string;
            instructions: string | null;
            medicines: Medicine[];
        } | null;
    };
}

export default function DoctorPrescriptions() {
    const { profile } = useDoctorDashboard();
    const [prescriptions, setPrescriptions] = useState<PrescriptionAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedRx, setSelectedRx] = useState<PrescriptionAppointment | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{
        instructions: string;
        medicines: Medicine[];
    }>({ instructions: "", medicines: [] });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const data = await getDoctorPrescriptionsList();
            setPrescriptions(data.filter((d: PrescriptionAppointment) =>
                d.consultation?.prescription?.medicines &&
                d.consultation.prescription.medicines.length > 0
            ));
        } catch (error) {
            console.error("Failed to fetch prescriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = prescriptions.filter((rx) =>
        `${rx.patient.firstName} ${rx.patient.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        rx.consultation?.medicalRecord?.diagnosis?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
        <div className="flex min-h-screen bg-gray-50/50 font-outfit">
            <DoctorSidebar />
            <div className="flex-1 flex flex-col pl-64">
                <DoctorTopNav
                    doctorName={`Dr. ${profile?.firstName} ${profile?.lastName}`}
                    doctorSpecialty={profile?.specialty}
                    avatarUrl={profile?.avatarUrl}
                />

                <main className="p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Prescriptions</h1>
                            <p className="text-gray-500 font-medium mt-1">
                                View and manage prescriptions you've issued.
                            </p>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by patient or diagnosis..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/20 w-80 transition-all font-medium shadow-sm"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-32 bg-white rounded-[2.5rem] border border-gray-100">
                            <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                            <FileText className="w-16 h-16 text-gray-200 mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2">No prescriptions found</h3>
                            <p className="text-gray-500 font-medium text-sm max-w-xs text-center">
                                {search ? "No prescriptions match your search." : "You haven't issued any prescriptions yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filtered.map((rx) => (
                                <div
                                    key={rx.id}
                                    className="bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 text-teal-600 font-black text-sm group-hover:bg-teal-100 transition-colors">
                                            {rx.patient.firstName[0]}{rx.patient.lastName[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">
                                                {rx.patient.firstName} {rx.patient.lastName}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Calendar className="w-3.5 h-3.5 text-teal-500" />
                                                    <span className="font-bold">{formatDate(rx.appointmentDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Pill className="w-3.5 h-3.5 text-teal-500" />
                                                    <span className="font-bold">{rx.consultation.prescription?.medicines.length || 0} medicines</span>
                                                </div>
                                            </div>
                                            {rx.consultation.medicalRecord && (
                                                <p className="text-xs text-gray-400 font-bold mt-1">
                                                    Dx: <span className="text-gray-600">{rx.consultation.medicalRecord.diagnosis}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedRx(rx);
                                                setIsEditing(false);
                                            }}
                                            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-200"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedRx(rx);
                                                setEditForm({
                                                    instructions: rx.consultation.prescription?.instructions || "",
                                                    medicines: rx.consultation.prescription?.medicines.map(m => ({ ...m })) || []
                                                });
                                                setIsEditing(true);
                                            }}
                                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition-all flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Prescription Detail Modal */}
            {selectedRx && selectedRx.consultation.prescription && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRx(null)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-black">Prescription Details</h2>
                                    <p className="text-teal-100 text-sm font-medium mt-1">
                                        Issued on {formatDate(selectedRx.appointmentDate)}
                                    </p>
                                </div>
                                <button onClick={() => { setSelectedRx(null); setIsEditing(false); }} className="text-white/80 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="px-8 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-bold text-gray-900">{selectedRx.patient.firstName} {selectedRx.patient.lastName}</p>
                                <p className="text-xs text-gray-500">{selectedRx.patient.gender} • {selectedRx.patient.phone}</p>
                            </div>
                        </div>

                        <div className="px-8 py-6 space-y-6">
                            {/* Diagnosis */}
                            {selectedRx.consultation.medicalRecord && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Diagnosis</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedRx.consultation.medicalRecord.diagnosis}</p>
                                    <p className="text-xs text-gray-500 mt-1">{selectedRx.consultation.medicalRecord.symptoms}</p>
                                </div>
                            )}

                            {isEditing ? (
                                <div className="space-y-6">
                                    {/* Edit Medications */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Pill className="w-3.5 h-3.5 text-teal-500" />
                                                Edit Medications
                                            </p>
                                            <button
                                                onClick={() => setEditForm({
                                                    ...editForm,
                                                    medicines: [...editForm.medicines, { id: Date.now().toString(), name: "", dosage: "", frequency: "", duration: "" }]
                                                })}
                                                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Add Medicine
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {editForm.medicines.map((med, index) => (
                                                <div key={med.id || index} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                                                    <div className="grid grid-cols-2 gap-3 flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Medicine Name"
                                                            value={med.name}
                                                            onChange={(e) => {
                                                                const newMeds = [...editForm.medicines];
                                                                newMeds[index].name = e.target.value;
                                                                setEditForm({ ...editForm, medicines: newMeds });
                                                            }}
                                                            className="px-3 py-2 text-sm border-gray-200 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-medium"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Dosage (e.g. 500mg)"
                                                            value={med.dosage}
                                                            onChange={(e) => {
                                                                const newMeds = [...editForm.medicines];
                                                                newMeds[index].dosage = e.target.value;
                                                                setEditForm({ ...editForm, medicines: newMeds });
                                                            }}
                                                            className="px-3 py-2 text-sm border-gray-200 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Frequency (e.g. 1-0-1)"
                                                            value={med.frequency}
                                                            onChange={(e) => {
                                                                const newMeds = [...editForm.medicines];
                                                                newMeds[index].frequency = e.target.value;
                                                                setEditForm({ ...editForm, medicines: newMeds });
                                                            }}
                                                            className="px-3 py-2 text-sm border-gray-200 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Duration (e.g. 5 days)"
                                                            value={med.duration}
                                                            onChange={(e) => {
                                                                const newMeds = [...editForm.medicines];
                                                                newMeds[index].duration = e.target.value;
                                                                setEditForm({ ...editForm, medicines: newMeds });
                                                            }}
                                                            className="px-3 py-2 text-sm border-gray-200 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newMeds = editForm.medicines.filter((_, i) => i !== index);
                                                            setEditForm({ ...editForm, medicines: newMeds });
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {editForm.medicines.length === 0 && (
                                                <div className="text-center py-6 text-gray-400 text-sm font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    No medicines added yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Edit Instructions */}
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-teal-500" />
                                            Instructions & Notes
                                        </p>
                                        <textarea
                                            value={editForm.instructions}
                                            onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                                            rows={3}
                                            placeholder="Add any specific instructions for the patient..."
                                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500 block"
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if(!selectedRx?.consultation?.prescription?.id) return;
                                                setIsSaving(true);
                                                try {
                                                    await updateDoctorPrescription(selectedRx.consultation.prescription.id, editForm);
                                                    await fetchPrescriptions();
                                                    setIsEditing(false);
                                                    setSelectedRx(null);
                                                } catch (error) {
                                                    console.error("Failed to update prescription", error);
                                                } finally {
                                                    setIsSaving(false);
                                                }
                                            }}
                                            className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-lg shadow-teal-200/50 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
                                            disabled={isSaving || editForm.medicines.length === 0}
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* View Medications Table */}
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <Pill className="w-3.5 h-3.5 text-teal-500" />
                                            Medications
                                        </p>
                                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                        <th className="text-left px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Medicine</th>
                                                        <th className="text-left px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Dosage</th>
                                                        <th className="text-left px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Frequency</th>
                                                        <th className="text-left px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Duration</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedRx.consultation.prescription.medicines.map((med) => (
                                                        <tr key={med.id} className="border-b border-gray-50">
                                                            <td className="px-4 py-3 font-bold text-teal-700">{med.name}</td>
                                                            <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
                                                            <td className="px-4 py-3 text-gray-600">{med.frequency}</td>
                                                            <td className="px-4 py-3 text-gray-600">{med.duration}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* View Instructions */}
                                    {selectedRx.consultation.prescription.instructions && (
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Instructions</p>
                                            <p className="text-sm text-gray-700">{selectedRx.consultation.prescription.instructions}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
