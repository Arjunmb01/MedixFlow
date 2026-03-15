import axios from "axios";


const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials:true
})

api.interceptors.request.use((config) => {
    // HTTP-only cookies handle auth automatically
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                
                await axios.post(
                    "http://localhost:5000/api/auth/refresh-token",
                    {},
                    {withCredentials: true}
                )

                // Retry original request since the cookie was updated
                return api(originalRequest)

            } catch (error) {
                // Refresh token also failed/expired, redirect to landing page
                window.location.href = "/"
            }
        } 
        return Promise.reject(error)
    }
)

export default api