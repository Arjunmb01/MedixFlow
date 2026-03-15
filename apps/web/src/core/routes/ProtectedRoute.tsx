import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/core/store/hooks";

interface ProtectedRouteProps {
    children : React.ReactNode
    role: "PATIENT" | "ADMIN" | "DOCTOR"
}

export default function ProtectedRoute({
    children,
    role
}: ProtectedRouteProps) {
     const authState = useAppSelector(state => state.auth)

     // Check if the specific role required for this route is authenticated
     if (!authState[role].isAuthenticated) {
         if (role === "ADMIN") return <Navigate to="/admin/login" replace/>
         return <Navigate to="/patient/login" replace/>
     }

     return <>{children}</>
}