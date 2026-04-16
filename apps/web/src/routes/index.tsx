import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "@/modules/landing/pages/LandingPage"
import GuestRoute from "@/core/routes/GuestRoute"

import { AuthRoutes } from "@/modules/auth/routes"
import { PatientRoutes } from "@/modules/patient/routes"
import { AdminRoutes } from "@/modules/admin/routes"
import { DoctorRoutes } from "@/modules/doctor/routes"
import NotFoundPage from "@/core/pages/NotFoundPage"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import { UserRole } from "@/domain/auth/types/auth.types"
import NotificationsPage from "@/modules/shared/pages/NotificationsPage"

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
                {DoctorRoutes}
                <Route path="/notifications" element={
                    <ProtectedRoute role={[UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]}>
                        <NotificationsPage />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    )
}