import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/core/store/hooks";
import { UserRole } from "@/domain/auth/types/auth.types";

interface ProtectedRouteProps {
    children: React.ReactNode;
    role: UserRole | UserRole[];
}

type WithPersist = { _persist?: { rehydrated: boolean; version: number } };

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const authState = useAppSelector(state => state.auth);

    const isRehydrated = (authState as typeof authState & WithPersist)._persist?.rehydrated;
    if (!isRehydrated) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="w-10 h-10 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const roles = Array.isArray(role) ? role : [role];
    const isAuthorized = roles.some(r => authState[r]?.isAuthenticated);

    if (!isAuthorized) {
        const primaryRole = roles[0];
        if (primaryRole === UserRole.ADMIN) return <Navigate to="/admin/login" replace />;
        if (primaryRole === UserRole.DOCTOR) return <Navigate to="/doctor/login" replace />;
        return <Navigate to="/patient/login" replace />;
    }

    return <>{children}</>;
}