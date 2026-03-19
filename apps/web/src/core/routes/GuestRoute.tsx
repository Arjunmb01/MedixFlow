import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/core/store/hooks";

interface GuestRouteProps {
    children: React.ReactNode
    forRole?: "ADMIN" | "PATIENT" | "DOCTOR"
}

export default function GuestRoute({ children, forRole }: GuestRouteProps) {
    const authState = useAppSelector(state => state.auth)

    // If a specific role is target, only redirect if THAT role is already logged in
    if (forRole) {
        if (authState[forRole].isAuthenticated) {
            let dashboardPath = "/patient/dashboard";
            if (forRole === "ADMIN") dashboardPath = "/admin/dashboard";
            if (forRole === "DOCTOR") dashboardPath = "/doctor/dashboard";
            return <Navigate to={dashboardPath} replace />
        }
        return <>{children}</>
    }

    // Generic check for landing page / general auth pages
    if (authState.ADMIN.isAuthenticated) return <Navigate to="/admin/dashboard" replace />
    if (authState.PATIENT.isAuthenticated) return <Navigate to="/patient/dashboard" replace />
    if (authState.DOCTOR.isAuthenticated) return <Navigate to="/doctor/dashboard" replace />

    return <>{children}</>
}
