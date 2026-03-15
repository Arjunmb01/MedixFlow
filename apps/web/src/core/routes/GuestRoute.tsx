import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/core/store/hooks";

interface GuestRouteProps {
    children: React.ReactNode
    forRole?: "ADMIN" | "PATIENT" | "DOCTOR"
}

export default function GuestRoute({ children, forRole }: GuestRouteProps) {
    const authState = useAppSelector(state => state.auth)

    if (forRole) {
        if (authState[forRole].isAuthenticated) {
            const path = forRole === "ADMIN" ? "/admin/dashboard" : "/patient/dashboard"
            return <Navigate to={path} replace />
        }
    } else {
        if (authState.ADMIN.isAuthenticated) return <Navigate to="/admin/dashboard" replace />
        if (authState.PATIENT.isAuthenticated) return <Navigate to="/patient/dashboard" replace />
    }

    return <>{children}</>
}
