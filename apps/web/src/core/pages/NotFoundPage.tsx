import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, Stethoscope } from "lucide-react"

export default function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-outfit">
            <div className="max-w-md w-full text-center space-y-8 relative">
                {/* Decorative background elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl opacity-50 -z-10"></div>
                
                <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-teal-200 animate-bounce-slow">
                        <Stethoscope className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -right-2 bg-white px-4 py-2 rounded-2xl shadow-lg border border-gray-50 animate-pulse">
                        <span className="text-4xl font-black text-teal-600">404</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Checkup Failed!
                    </h1>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        We couldn't find the medical records (or page) you were looking for. It might have been moved or doesn't exist.
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
                        onClick={() => navigate("/")}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
                    >
                        <Home className="w-5 h-5" />
                        Return Home
                    </button>
                </div>

                <div className="pt-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MedixFlow Security Monitor</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s infinite ease-in-out;
                }
            `}</style>
        </div>
    )
}
