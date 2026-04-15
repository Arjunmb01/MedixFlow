import { useNavigate, useLocation } from "react-router-dom"
import { 
    LayoutDashboard, 
    Users, 
    UserRound, 
    CalendarCheck, 
    CreditCard, 
    ClipboardList, 
    BarChart3, 
    Settings, 
    LogOut 
} from "lucide-react"
import { useAppDispatch } from "@/core/store/hooks"
import { logout } from "@/modules/store/authSlice"
import { adminLogout } from "@/infrastructure/api/auth.api"
import { UserRole } from "@/domain/auth/types/auth.types"
import { toast } from "sonner"

const mainMenuItems = [
    { label: "Overview", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Staff", icon: Users, path: "/admin/staff" },
    { label: "Patient", icon: UserRound, path: "/admin/patients" },
    { label: "Appointment", icon: CalendarCheck, path: "/admin/appointments" },
    { label: "Payments", icon: CreditCard, path: "/admin/payments" },
    { label: "Leave Management", icon: ClipboardList, path: "/admin/leaves" },
    { label: "Reports", icon: BarChart3, path: "/admin/reports" },
]

export default function AdminSidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()

    const handleLogout = async () => {
        try {
            await adminLogout()
        } catch (e) {
            console.error("Logout failed", e)
        }
        dispatch(logout({ role: UserRole.ADMIN }))
        toast.info("Logged out successfully")
        navigate("/admin/login")
    }

    const renderMenuItem = (item: any) => {
        const isActive = location.pathname === item.path
        return (
            <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                    ? "bg-primary-600 text-white font-semibold shadow-lg shadow-primary-900/40" 
                    : "hover:bg-white/5 hover:text-white font-medium"
                }`}
            >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-[14px]">{item.label}</span>
            </button>
        )
    }

    return (
        <div className="w-64 bg-[#0F172A] flex flex-col h-screen fixed left-0 top-0 z-50 text-gray-400">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <img src="/logo.png" alt="MedixFlow Logo" className="h-9 w-auto object-contain brightness-110" />
                <span className="text-xl font-black text-white tracking-tight font-outfit">MedixFlow</span>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {mainMenuItems.map(renderMenuItem)}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 space-y-2 border-t border-white/5">
                {renderMenuItem({ 
                    label: "Clinical & Vital settings", 
                    icon: Settings, 
                    path: "/admin/settings" 
                })}
                
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-[14px]">Sign Out</span>
                </button>
            </div>
        </div>
    )
}
