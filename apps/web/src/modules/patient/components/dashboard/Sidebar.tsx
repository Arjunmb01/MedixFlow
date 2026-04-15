import { useNavigate, useLocation } from "react-router-dom"
import { 
    LayoutDashboard, 
    UserSearch, 
    CalendarDays, 
    Wallet, 
    FileText, 
    Pill, 
    CreditCard, 
    MessageSquare, 
    Settings, 
    LogOut 
} from "lucide-react"
import { useAppDispatch } from "@/core/store/hooks"
import { logout } from "@/modules/store/authSlice"
import { logout as apiLogout } from "@/infrastructure/api/auth.api"
import { UserRole } from "@/domain/auth/types/auth.types"
import { toast } from "sonner"

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/patient/dashboard" },
    { label: "Find Doctors", icon: UserSearch, path: "/patient/find-doctors" },
    { label: "My Appointments", icon: CalendarDays, path: "/patient/appointments" },
    { label: "Wallet", icon: Wallet, path: "/patient/wallet" },
    { label: "Medical Records", icon: FileText, path: "/patient/records" },
    { label: "Prescriptions", icon: Pill, path: "/patient/prescriptions" },
    { label: "Billing", icon: CreditCard, path: "/patient/billing" },
    { label: "Message", icon: MessageSquare, path: "/patient/messages" },
    { label: "Profile & Settings", icon: Settings, path: "/patient/profile" },
]

export default function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()

    const handleLogout = async () => {
        try {
            await apiLogout()
        } catch (e) {
            console.error("Logout failed", e)
        }
        dispatch(logout({ role: UserRole.PATIENT }))
        toast.info("Logged out successfully")
        navigate("/patient/login")
    }

    return (
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-50">
            <div className="p-6 flex items-center gap-2">
                <img src="/logo.png" alt="MedixFlow Logo" className="h-9 w-auto object-contain" />
                <span className="text-xl font-black text-gray-900 tracking-tight font-outfit">MedixFlow</span>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                isActive 
                                ? "bg-primary-50 text-primary-600 font-black" 
                                : "text-gray-500 hover:bg-gray-50 font-bold"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-primary-600" : "text-gray-400"}`} />
                            <span className="text-[14px]">{item.label}</span>
                        </button>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium"
                >
                    <LogOut className="w-5 h-5 text-gray-400" />
                    <span className="text-[14px]">Logout</span>
                </button>
            </div>
        </div>
    )
}
