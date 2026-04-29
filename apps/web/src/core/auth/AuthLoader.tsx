import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAccessToken, logout } from "@/modules/store/authSlice";
import { UserRole } from "@/domain/auth/types/auth.types";
import axios from "axios";


interface AuthLoaderProps {
    children: React.ReactNode;
}

export const AuthLoader = ({ children }: AuthLoaderProps) => {
    const dispatch = useDispatch();
    const persistedRole = useSelector((state: any) => state.auth.persistedRole);
    const [isRestoring, setIsRestoring] = useState(!!persistedRole);

    useEffect(() => {
        const restoreSession = async () => {
            if (!persistedRole) {
                setIsRestoring(false);
                return;
            }

            try {
                // Determine refresh URL based on role
                const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                let refreshUrl = `${baseUrl}/auth/refresh-token`;
                if (persistedRole === UserRole.ADMIN) refreshUrl = `${baseUrl}/admin/auth/refresh-token`;
                if (persistedRole === UserRole.DOCTOR) refreshUrl = `${baseUrl}/doctor/auth/refresh-token`;

                const response = await axios.post(
                    refreshUrl,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data;
                dispatch(setAccessToken({ role: persistedRole, accessToken }));
            } catch (error: any) {
                console.error("Failed to restore session:", error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    dispatch(logout({ role: persistedRole }));
                }
            } finally {
                setIsRestoring(false);
            }
        };

        restoreSession();
    }, [persistedRole, dispatch]);

    if (isRestoring) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return <>{children}</>;
};
