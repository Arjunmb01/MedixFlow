import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { store } from "../store/store";
import { setAccessToken, logout } from "@/modules/store/authSlice";
import { UserRole } from "@/domain/auth/types/auth.types";
import { toast } from "sonner";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
})

function getRoleFromUrl(url?: string): UserRole {
    const state = store.getState();
    const persistedRole = state.auth.persistedRole;

    if (url?.startsWith("/admin") || url?.includes("/admin/")) return UserRole.ADMIN;
    if (url === "/doctor" || url?.startsWith("/doctor/") || (url?.includes("/doctor") && !url?.includes("/doctors"))) return UserRole.DOCTOR;
    if (url === "/patient" || url?.startsWith("/patient/")) return UserRole.PATIENT;
    
    // Static context awareness for top-level routes
    if ((url?.includes("/common/") || url?.includes("/doctors") || url?.startsWith("/payments/")) && typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path.startsWith("/admin")) return UserRole.ADMIN;
        if (path.startsWith("/patient")) return UserRole.PATIENT;
        if (path.startsWith("/doctor")) return UserRole.DOCTOR;
    }

    const finalRole = (persistedRole as UserRole) || UserRole.PATIENT;
    console.log(`[Axios] Detected role for URL ${url}: ${finalRole}`);
    return finalRole;
}



function getLoginPath(role: UserRole) {
    if (role === UserRole.ADMIN) return "/admin/login"
    if (role === UserRole.DOCTOR) return "/doctor/login"
    return "/patient/login"
}

function getRefreshUrl(role: UserRole) {
    if (role === UserRole.ADMIN) return "http://localhost:5000/api/admin/auth/refresh-token"
    if (role === UserRole.DOCTOR) return "http://localhost:5000/api/doctor/auth/refresh-token"
    return "http://localhost:5000/api/auth/refresh-token"
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const role = getRoleFromUrl(config.url);
    const token = state.auth[role].accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        const isLoginRequest = originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/google-login");
        if (error.response?.status === 403 && (error.response?.data?.code === "ACCOUNT_BLOCKED" || error.response?.data?.code === "ACCOUNT_SUSPENDED") && !isLoginRequest) {
            const role = getRoleFromUrl(originalRequest.url);
            store.dispatch(logout({ role: role as any }));
            const isSuspended = error.response?.data?.code === "ACCOUNT_SUSPENDED";
            toast.error(isSuspended ? "Your account has been suspended. Please contact support." : "Your account has been blocked by the administrator. Please contact support.");
            window.location.href = getLoginPath(role);
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const role = getRoleFromUrl(originalRequest.url);
                const refreshUrl = getRefreshUrl(role);

                const response = await axios.post(
                    refreshUrl,
                    {},
                    { withCredentials: true }
                )

                const { accessToken } = response.data;
                store.dispatch(setAccessToken({ role, accessToken }));

                // Manually update the Authorization header for the retry
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                
                return api(originalRequest);

            } catch (refreshError: any) {
                const role = getRoleFromUrl(originalRequest.url);
                store.dispatch(logout({ role: role as any }));

                if (refreshError.response?.data?.message?.includes("blocked")) {
                    toast.error("Your account has been blocked by the administrator.");
                }

                window.location.href = getLoginPath(role);
            }
        }
        return Promise.reject(error)
    }
)

export default api