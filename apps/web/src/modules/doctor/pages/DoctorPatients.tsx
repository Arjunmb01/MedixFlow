import { useState, useEffect } from "react";
import DoctorSidebar from "../components/DoctorSidebar";
import DoctorTopNav from "../components/DoctorTopNav";
import { getDoctorConsultedPatients } from "@/infrastructure/api/doctor.api";
import { useDoctorDashboard } from "@/application/doctor/hooks/useDoctorDashboard";
import { Users, Search, Loader2, Calendar, Phone, Stethoscope } from "lucide-react";

interface Patient {
    patientId: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    lastVisit: string;
    lastDiagnosis: string | null;
    totalVisits: number;
}

export default function DoctorPatients() {
    const { profile } = useDoctorDashboard();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await getDoctorConsultedPatients();
            setPatients(data);
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = patients.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.toLowerCase().includes(search.toLowerCase())
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
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Patients</h1>
                            <p className="text-gray-500 font-medium mt-1">
                                Patients you have consulted with.
                            </p>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search patient..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/20 w-72 transition-all font-medium shadow-sm"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-32 bg-white rounded-[2.5rem] border border-gray-100">
                            <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                            <Users className="w-16 h-16 text-gray-200 mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2">No patients found</h3>
                            <p className="text-gray-500 font-medium text-sm max-w-xs text-center">
                                {search ? "No patients match your search." : "You haven't completed any consultations yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Last Visit</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Diagnosis</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Visits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((p) => (
                                        <tr key={p.patientId} className="group hover:bg-teal-50/30 transition-all">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100 text-teal-600 font-black text-sm">
                                                        {p.firstName[0]}{p.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{p.firstName} {p.lastName}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{p.gender || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {p.phone || "—"}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {formatDate(p.lastVisit)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Stethoscope className="w-3.5 h-3.5 text-amber-500" />
                                                    <span className="text-gray-700 font-medium">{p.lastDiagnosis || "—"}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-100">
                                                    {p.totalVisits} visit{p.totalVisits > 1 ? "s" : ""}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
