import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/core/store/hooks";
import { UserRole } from "@/domain/auth/types/auth.types";

interface GuestRouteProps {
    children: React.ReactNode
    forRole?: UserRole
}

export default function GuestRoute({ children, forRole }: GuestRouteProps) {
    const authState = useAppSelector(state => state.auth)

    // If a specific role is target, only redirect if THAT role is already logged in
    if (forRole) {
        if (authState[forRole].isAuthenticated) {
<<<<<<< HEAD
            let dashboardPath = "/dashboard";
=======
            let dashboardPath = "/patient/dashboard";
>>>>>>> 871c7862bcf397135f6809ff88e6ccf8cd29ad3c
            if (forRole === UserRole.ADMIN) dashboardPath = "/admin/dashboard";
            if (forRole === UserRole.DOCTOR) dashboardPath = "/doctor/dashboard";
            return <Navigate to={dashboardPath} replace />;
        }
        return <>{children}</>
    }

    // Generic check for landing page / general auth pages
    if (authState[UserRole.ADMIN].isAuthenticated) return <Navigate to="/admin/dashboard" replace />
<<<<<<< HEAD
    if (authState[UserRole.PATIENT].isAuthenticated) return <Navigate to="/dashboard" replace />
=======
    if (authState[UserRole.PATIENT].isAuthenticated) return <Navigate to="/patient/dashboard" replace />
>>>>>>> 871c7862bcf397135f6809ff88e6ccf8cd29ad3c
    if (authState[UserRole.DOCTOR].isAuthenticated) return <Navigate to="/doctor/dashboard" replace />

    return <>{children}</>
}
