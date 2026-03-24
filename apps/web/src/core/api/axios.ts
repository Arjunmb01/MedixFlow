import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { store } from "../store/store";
import { setAccessToken, logout } from "@/modules/store/authSlice";
import { toast } from "sonner";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
})

function getRoleFromUrl(url?: string): "ADMIN" | "PATIENT" | "DOCTOR" {
    if (url?.startsWith("/admin") || url?.includes("/admin/")) return "ADMIN"
    
    if (url === "/doctor" || url?.startsWith("/doctor/") || (url?.includes("/doctor") && !url?.includes("/doctors"))) return "DOCTOR"
    
    if ((url?.includes("/common/") || url?.includes("/doctors")) && typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path.startsWith("/admin")) return "ADMIN"
        if (path.startsWith("/patient")) return "PATIENT"
        if (path.startsWith("/doctor")) return "DOCTOR"
    }

    return "PATIENT"
}


function getLoginPath(role: "ADMIN" | "PATIENT" | "DOCTOR") {
    if (role === "ADMIN") return "/admin/login"
    if (role === "DOCTOR") return "/doctor/login"
    return "/patient/login"
}

function getRefreshUrl(role: "ADMIN" | "PATIENT" | "DOCTOR") {
    if (role === "ADMIN") return "http://localhost:5000/api/admin/auth/refresh-token"
    if (role === "DOCTOR") return "http://localhost:5000/api/doctor/auth/refresh-token"
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
        if (error.response?.status === 403 && error.response?.data?.code === "ACCOUNT_BLOCKED" && !isLoginRequest) {
            const role = getRoleFromUrl(originalRequest.url);
            store.dispatch(logout({ role: role as any }));
            toast.error("Your account has been blocked by the administrator. Please contact support.");
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

                const { accessToken } = response.data
                store.dispatch(setAccessToken({ role, accessToken }))
                return api(originalRequest)

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