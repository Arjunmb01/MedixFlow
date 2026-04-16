import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/core/store/hooks";
import { UserRole } from "@/domain/auth/types/auth.types";

interface GuestRouteProps {
    children: React.ReactNode
    forRole?: UserRole
}

export default function GuestRoute({ children, forRole }: GuestRouteProps) {
    const authState = useAppSelector(state => state.auth)

    
    if (forRole) {
        if (authState[forRole].isAuthenticated) {
            let dashboardPath = "/dashboard";
            if (forRole === UserRole.ADMIN) dashboardPath = "/admin/dashboard";
            if (forRole === UserRole.DOCTOR) dashboardPath = "/doctor/dashboard";
            return <Navigate to={dashboardPath} replace />;
        }
        return <>{children}</>
    }

    // Generic check for landing page / general auth pages
    if (authState[UserRole.ADMIN].isAuthenticated) return <Navigate to="/admin/dashboard" replace />
    if (authState[UserRole.PATIENT].isAuthenticated) return <Navigate to="/dashboard" replace />
    if (authState[UserRole.DOCTOR].isAuthenticated) return <Navigate to="/doctor/dashboard" replace />

    return <>{children}</>
}
