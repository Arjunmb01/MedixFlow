import ProtectedRoute from "@/core/routes/ProtectedRoute"
import AdminDashboard from "@/modules/admin/pages/AdminDashboard"
import AdminLogin from "@/modules/auth/pages/AdminLogin"
import PatientLogin from "@/modules/auth/pages/PatientLogin"
import Register from "@/modules/auth/pages/Register"
import VerifyOtp from "@/modules/auth/pages/VerifyOtp"
import LandingPage from "@/modules/landing/pages/LandingPage"
import PatientDashboard from "@/modules/patient/pages/PatientDashboard"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import GuestRoute from "@/core/routes/GuestRoute"

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/register" element={
                    <GuestRoute>
                        <Register />
                    </GuestRoute>
                } />
                <Route path="/auth/verify-otp" element={
                    <GuestRoute>
                        <VerifyOtp />
                    </GuestRoute>
                } />
                <Route path="/patient/login" element={
                    <GuestRoute forRole="PATIENT">
                        <PatientLogin />
                    </GuestRoute>
                } />
                <Route path="/admin/login" element={
                    <GuestRoute forRole="ADMIN">
                        <AdminLogin />
                    </GuestRoute>
                } />
                <Route
                    path="/patient/dashboard"
                    element={
                        <ProtectedRoute role="PATIENT">
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute role="ADMIN">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}