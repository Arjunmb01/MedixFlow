import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "@/modules/landing/pages/LandingPage"

import { AuthRoutes } from "@/modules/auth/routes"
import { PatientRoutes } from "@/modules/patient/routes"
import { AdminRoutes } from "@/modules/admin/routes"
import { DoctorRoutes } from "@/modules/doctor/routes"
import NotFoundPage from "@/core/pages/NotFoundPage"

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                {AuthRoutes}
                {PatientRoutes}
                {AdminRoutes}
                {DoctorRoutes}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    )
}