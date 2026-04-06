import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopNav from "../components/dashboard/TopNav";
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile";
import { getPatientAppointments } from "@/infrastructure/api/patient.api";
import { Pill, Calendar, Clock, Loader2, FileText } from "lucide-react";

interface PrescriptionItem {
    appointmentId: string;
    doctorName: string;
    specialization: string;
    date: string;
    slotStart: string;
    medicineCount: number;
    diagnosis: string;
}

export default function Prescriptions() {
    const { profile } = usePatientProfile();
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const appointments = await getPatientAppointments();
            // Filter only completed appointments that have prescriptions
            const items: PrescriptionItem[] = appointments
                .filter((apt: { status: string; consultation?: { prescription?: { medicines: unknown[] } } }) =>
                    apt.status === "COMPLETED" &&
                    apt.consultation?.prescription?.medicines &&
                    apt.consultation.prescription.medicines.length > 0
                )
                .map((apt: {
                    id: string;
                    doctor: { firstName: string; lastName: string; specialization: { name: string } | null };
                    appointmentDate: string;
                    slotStart: string;
                    consultation: {
                        medicalRecord?: { diagnosis: string };
                        prescription: { medicines: unknown[] };
                    };
                }) => ({
                    appointmentId: apt.id,
                    doctorName: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
                    specialization: apt.doctor.specialization?.name || "Specialist",

                    date: apt.appointmentDate,
                    slotStart: apt.slotStart,
                    medicineCount: apt.consultation.prescription.medicines.length,
                    diagnosis: apt.consultation.medicalRecord?.diagnosis || "—",
                }));
            setPrescriptions(items);
        } catch (error) {
            console.error("Failed to fetch prescriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric", year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-outfit">
            <Sidebar />

            <div className="flex-1 ml-64">
                <TopNav
                    userName={`${profile?.name}`}
                    patientId={profile?.patientId || "PX-202"}
                />

                <main className="pt-28 pb-12 px-8 max-w-7xl mx-auto">
                    <header className="mb-10">
                        <h1 className="text-[32px] font-black text-[#0F172A] tracking-tight">
                            Prescriptions
                        </h1>
                        <p className="text-[#64748B] font-medium mt-1">
                            View and download prescriptions from your consultations.
                        </p>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-[#E2E8F0]">
                            <Loader2 className="w-12 h-12 text-[#3B82F6] animate-spin mb-4" />
                            <p className="text-[#64748B] font-bold">Loading prescriptions...</p>
                        </div>
                    ) : prescriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-[#E2E8F0]">
                            <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-6">
                                <Pill className="w-10 h-10 text-[#CBD5E1]" />
                            </div>
                            <h3 className="text-xl font-black text-[#0F172A] mb-2">No prescriptions yet</h3>
                            <p className="text-[#64748B] font-medium max-w-xs text-center">
                                Prescriptions will appear here after your doctor completes a consultation.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {prescriptions.map((rx) => (
                                <div
                                    key={rx.appointmentId}
                                    className="bg-white p-6 rounded-[2rem] border border-[#E2E8F0] hover:border-[#3B82F6] hover:shadow-xl hover:shadow-blue-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-teal-50 rounded-[1.5rem] flex items-center justify-center border border-teal-100 group-hover:bg-teal-100 transition-colors">
                                            <FileText className="w-8 h-8 text-teal-500 group-hover:text-teal-600 transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-[#0F172A]">{rx.doctorName}</h3>
                                            <p className="text-[#64748B] font-bold text-sm mt-0.5">{rx.specialization}</p>

                                            <div className="flex items-center gap-6 mt-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-[#3B82F6]" />
                                                    <span className="text-sm font-black text-[#475569]">{formatDate(rx.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-[#3B82F6]" />
                                                    <span className="text-sm font-black text-[#475569]">{rx.slotStart}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Pill className="w-4 h-4 text-teal-500" />
                                                    <span className="text-sm font-bold text-teal-600">{rx.medicineCount} medicine{rx.medicineCount > 1 ? "s" : ""}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs font-bold text-gray-500 mt-2">
                                                Diagnosis: <span className="text-gray-900">{rx.diagnosis}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/patient/prescriptions/${rx.appointmentId}`)}
                                        className="px-6 py-3 bg-teal-600 text-white rounded-xl text-[13px] font-black uppercase tracking-wider hover:bg-teal-700 transition-all flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        View Prescription
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
