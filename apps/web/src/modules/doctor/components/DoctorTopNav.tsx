import { Search, MessageSquare } from "lucide-react"
import NavbarNotificationBell from "@/modules/shared/components/notifications/NavbarNotificationBell"

interface Props {
    doctorName?: string
    doctorSpecialty?: string
    avatarUrl?: string
}

export default function DoctorTopNav({ doctorName = "Doctor", doctorSpecialty = "Specialist", avatarUrl }: Props) {
    const initials = doctorName.split(" ").map(n => n[0]).join("")

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50 font-outfit">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search patients by name, ID or DOB (⌘F)"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/10 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <NavbarNotificationBell />
                    <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all border border-transparent hover:border-teal-100">
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-gray-900 leading-tight">{doctorName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{doctorSpecialty}</p>
                    </div>
                    <div className="w-11 h-11 bg-teal-800 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-teal-100 overflow-hidden">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={doctorName} className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                </div>
            </div>

        </header>
    )
}
