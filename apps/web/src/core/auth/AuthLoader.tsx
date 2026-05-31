import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAccessToken, logout } from "@/modules/store/authSlice";
import { UserRole } from "@/domain/auth/types/auth.types";
import axios from "axios";
import type { RootState } from "@/core/store/store";

interface AuthLoaderProps {
  children: React.ReactNode;
}

export const AuthLoader = ({ children }: AuthLoaderProps) => {
  const dispatch = useDispatch();
  const persistedRole = useSelector((state: RootState) => state.auth.persistedRole);
  const accessToken = useSelector((state: RootState) =>
    persistedRole ? state.auth[persistedRole]?.accessToken : null
  );
  const [isRestoring, setIsRestoring] = useState(
    () => !!persistedRole && !accessToken
  );

  useEffect(() => {
    const restoreSession = async () => {
      if (!persistedRole) {
        setIsRestoring(false);
        return;
      }

      if (accessToken) {
        setIsRestoring(false);
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        let refreshUrl = `${baseUrl}/auth/refresh-token`;
        if (persistedRole === UserRole.ADMIN) refreshUrl = `${baseUrl}/admin/auth/refresh-token`;
        if (persistedRole === UserRole.DOCTOR) refreshUrl = `${baseUrl}/doctor/auth/refresh-token`;

        const response = await axios.post(refreshUrl, {}, { withCredentials: true });
        const { accessToken: newToken } = response.data;
        dispatch(setAccessToken({ role: persistedRole, accessToken: newToken }));
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        console.error("Failed to restore session:", error);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          dispatch(logout({ role: persistedRole }));
        }
      } finally {
        setIsRestoring(false);
      }
    };

    void restoreSession();
  }, [persistedRole, accessToken, dispatch]);

  if (isRestoring) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
};
