import { Search } from "lucide-react"
import NavbarNotificationBell from "@/modules/shared/components/notifications/NavbarNotificationBell"

interface Props {
    userName: string
    patientId: string
    title?: string
}

export default function TopNav({ userName, patientId, title = "Health Overview" }: Props) {
    return (
        <div className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-50">
            <h2 className="text-[18px] font-bold text-gray-900">{title}</h2>

            <div className="flex-1 max-w-xl mx-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search doctors, medicines (⌘K)"
                        className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <NavbarNotificationBell />

                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="flex flex-col items-end">
                        <span className="text-[14px] font-bold text-gray-900 leading-tight">{userName}</span>
                        <span className="text-[11px] font-medium text-gray-500">Patient ID: {patientId}</span>
                    </div>
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-100">
                        {userName.split(' ').map(n => n[0]).join('')}
                    </div>
                </div>
            </div>
        </div>
    )
}
