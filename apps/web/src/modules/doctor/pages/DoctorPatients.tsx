import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import DoctorTopNav from "../components/DoctorTopNav";
import { useDoctorDashboard } from "@/application/doctor/hooks/useDoctorDashboard";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

export default function DoctorPatients() {
    const { profile } = useDoctorDashboard();
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-gray-50/50 font-outfit">
            <DoctorSidebar />
            <div className="flex-1 flex flex-col pl-64">
                <DoctorTopNav
                    doctorName={`Dr. ${profile?.firstName} ${profile?.lastName}`}
                    doctorSpecialty={profile?.specialty}
                    avatarUrl={profile?.avatarUrl}
                />

                <main className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-md w-full text-center space-y-8 relative pb-20">
                        {/* Decorative background elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-50 rounded-full blur-3xl opacity-50 -z-10"></div>
                        
                        <div className="relative">
                            <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-rose-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-red-200 animate-pulse-slow">
                                <Lock className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-lg border border-red-50">
                                <ShieldAlert className="w-6 h-6 text-red-600" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                Access Restricted
                            </h1>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                The centralized Patient Directory is currently restricted. Please use the <span className="text-teal-600 font-bold">Live Queue</span> to access patient records during active consultations.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Go Back
                            </button>
                            <button 
                                onClick={() => navigate("/doctor/dashboard")}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
                            >
                                <Home className="w-5 h-5" />
                                Dashboard
                            </button>
                        </div>

                        <div className="pt-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full border border-red-100">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Security Policy Enforcement</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
