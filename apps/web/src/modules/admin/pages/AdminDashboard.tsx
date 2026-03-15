import { useAppDispatch } from "@/core/store/hooks"
import { logout } from "@/modules/store/authSlice"
import { useNavigate } from "react-router-dom"
import { logout as apiLogout } from "@/infrastructure/api/auth.api"

export default function AdminDashboard() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await apiLogout()
        } catch (e) {
            console.error("Logout API failed", e)
        }
        dispatch(logout({ role: "ADMIN" }))
        navigate("/admin/login")
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
                Logout
            </button>
        </div>
    )
}