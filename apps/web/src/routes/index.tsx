import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "@/modules/landing/pages/LandingPage"
import GuestRoute from "@/core/routes/GuestRoute"
import { AuthRoutes } from "@/modules/auth/routes"
import { PatientRoutes } from "@/modules/patient/routes"
import { AdminRoutes } from "@/modules/admin/routes"
import NotFoundPage from "@/core/pages/NotFoundPage"

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                    <GuestRoute>
                        <LandingPage />
                    </GuestRoute>
                } />
                {AuthRoutes}
                {PatientRoutes}
                {AdminRoutes}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    )
}