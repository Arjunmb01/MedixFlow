import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "../store/store";
import { setAccessToken } from "@/modules/store/authSlice";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials:true
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const state = store.getState();
  const isAdminPath = config.url?.includes("/admin");
  const isPatientPath = config.url?.includes("/patient") || config.url?.includes("/auth");

  let token = null;
  if (isAdminPath) {
    token = state.auth.ADMIN.accessToken;
  } else if (isPatientPath) {
    token = state.auth.PATIENT.accessToken;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const isAdmin = originalRequest.url?.includes("/admin");
                const role = isAdmin ? "ADMIN" : "PATIENT";
                
                const refreshUrl = isAdmin 
                    ? "http://localhost:5000/api/admin/auth/refresh-token" 
                    : "http://localhost:5000/api/auth/refresh-token";

                const response = await axios.post(
                    refreshUrl,
                    {},
                    {withCredentials: true}
                )

                const { accessToken } = response.data
                store.dispatch(setAccessToken({ role, accessToken }))
                return api(originalRequest)

            } catch (error) {
                window.location.href = "/"
            }
        } 
        return Promise.reject(error)
    }
)

export default api