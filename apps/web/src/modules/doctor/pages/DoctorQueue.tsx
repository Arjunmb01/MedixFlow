import { useState, useEffect } from "react";
import { getDoctorQueue, startConsultation } from "@/infrastructure/api/consultation.api";
import { Users, Clock, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import DoctorTopNav from "../components/DoctorTopNav";

export default function DoctorQueue() {
    const [queue, setQueue] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            const data = await getDoctorQueue();
            setQueue(data);
        } catch (error) {
            console.error("Failed to fetch queue", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartConsultation = async (consultationId: string, status: string) => {
        if (status === "IN_PROGRESS" || status === "COMPLETED") {
            navigate(`/doctor/workspace/${consultationId}`);
            return;
        }

        setIsStarting(consultationId);
        try {
            await startConsultation(consultationId);
            navigate(`/doctor/workspace/${consultationId}`);
        } catch (error) {
            console.error("Failed to start consultation", error);
            alert("Failed to start consultation.");
        } finally {
            setIsStarting(null);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <DoctorSidebar />
            <div className="flex-1 flex flex-col overflow-hidden pl-64">
                <DoctorTopNav />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Patient Queue</h1>
                                <p className="text-gray-500 mt-2 text-sm">Patients checked in for today's physical consultation.</p>
                            </div>
                            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
                                <Users className="w-5 h-5" />
                                {queue.length} in Queue
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : queue.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                                <Users className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900">Queue is Empty</h3>
                                <p className="text-gray-500 mt-2 max-w-sm">There are no patients waiting at the clinic right now. Check back later.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {queue.map((consultation, index) => (
                                    <div 
                                        key={consultation.id} 
                                        className={`bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm border ${
                                            consultation.status === "IN_PROGRESS" 
                                            ? "border-green-400 ring-2 ring-green-100" 
                                            : consultation.status === "COMPLETED"
                                                ? "border-blue-400 ring-2 ring-blue-100"
                                                : "border-gray-100 hover:border-blue-200"
                                        } transition-all`}
                                    >
                                        <div className="flex gap-6 items-center">
                                            <div className="flex flex-col items-center justify-center bg-gray-50 w-16 h-16 rounded-xl font-bold text-gray-500 text-lg border border-gray-100">
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {consultation.patient.firstName} {consultation.patient.lastName}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        Slot: {consultation.appointment.slotStart}
                                                    </span>
                                                    {consultation.status === "IN_PROGRESS" ? (
                                                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                                                            Ongoing
                                                        </span>
                                                    ) : consultation.status === "COMPLETED" ? (
                                                        <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                                                            Completed
                                                        </span>
                                                    ) : (
                                                        <span className="bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                                                            Waiting
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleStartConsultation(consultation.id, consultation.status)}
                                            disabled={isStarting === consultation.id}
                                            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                                                consultation.status === "IN_PROGRESS"
                                                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                                                : consultation.status === "COMPLETED"
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                                    : "bg-[#0066cc] hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                            }`}
                                        >
                                            {isStarting === consultation.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    {consultation.status === "IN_PROGRESS" ? "Resume Consultation" : consultation.status === "COMPLETED" ? "Edit Prescription" : "Start Consultation"}
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
