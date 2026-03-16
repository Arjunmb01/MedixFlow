import { Calendar, Video, ArrowRight } from "lucide-react"
import Avatar from "@/modules/patient/components/ui/Avatar"

export default function UpcomingCareCard() {
    return (
        <div className="bg-gradient-to-br from-[#0066cc] to-[#004d99] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold tracking-[0.2em] opacity-80 uppercase">Upcoming Care</span>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-bold border border-white/20">
                        Tomorrow, 10:30 AM
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-6">
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-[#0066cc] text-2xl font-bold shadow-xl">
                        SM
                    </div>
                    <div>
                        <h3 className="text-[26px] font-bold tracking-tight">Dr. Sarah Mitchell</h3>
                        <div className="flex items-center gap-2 mt-1.5 opacity-80 text-[14px] font-medium">
                            <Video className="w-4 h-4" />
                            <span>Cardiologist • Video Consult</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex gap-4">
                    <button className="bg-white text-[#0066cc] px-6 py-3 rounded-2xl font-bold text-[14px] flex items-center gap-2 hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20">
                        <Video className="w-4 h-4" />
                        Join Consultation
                    </button>
                    <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl font-bold text-[14px] hover:bg-white/20 transition-all">
                        Manage Appointment
                    </button>
                    <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl font-bold text-[14px] hover:bg-white/20 transition-all">
                        Rebook
                    </button>
                </div>
            </div>
        </div>
    )
}