import { useNavigate, useLocation } from "react-router-dom"
import { useAppDispatch } from "@/core/store/hooks"
import { logout } from "@/modules/store/authSlice"
import { doctorLogout } from "@/infrastructure/api/auth.api"
import { UserRole } from "@/domain/auth/types/auth.types"
import { toast } from "sonner"
import { 
    LayoutDashboard, 
    Calendar, 
    MessageSquare, 
    FileText, 
    Settings,
    LogOut,
    Clock,
    UserCircle,
    CalendarOff
} from "lucide-react"

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/doctor/dashboard" },
    { icon: Clock, label: "Live Queue", path: "/doctor/queue" },
    { icon: Calendar, label: "Appointments", path: "/doctor/appointments" },
    { icon: FileText, label: "Prescriptions", path: "/doctor/prescriptions" },
    { icon: CalendarOff, label: "Leave", path: "/doctor/leave" },
    { icon: UserCircle, label: "My Calendar", path: "/doctor/calendar" },
    { icon: MessageSquare, label: "Message", path: "/doctor/messages" },
    { icon: Settings, label: "Profile", path: "/doctor/profile" },
]

export default function DoctorSidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()

    const handleLogout = async () => {
        try {
            await doctorLogout()
        } catch (e) {
            console.error("Logout failed", e)
        }
        dispatch(logout({ role: UserRole.DOCTOR }))
        toast.info("Workspace session ended")
        navigate("/doctor/login")
    }

    return (
        <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col font-outfit fixed left-0 top-0 z-[60]">
        <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-10">
                <img src="/logo.png" alt="MedixFlow Logo" className="h-9 w-auto object-contain" />
                <span className="text-xl font-black text-gray-900 tracking-tight font-outfit">MedixFlow</span>
            </div>

            <nav className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                                isActive 
                                ? 'bg-primary-600 text-white shadow-xl shadow-primary-100' 
                                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50/50'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`} />
                            <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{item.label}</span>
                        </button>
                    )
                })}
            </nav>
        </div>

            <div className="mt-4 p-8 pt-0 pb-10">
                 <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold group"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm">End Workspace</span>
                </button>
            </div>
        </aside>

    )
}
