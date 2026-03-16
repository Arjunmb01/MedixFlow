import { Route } from "react-router-dom"
import GuestRoute from "@/core/routes/GuestRoute"
import Register from "../pages/Register"
import VerifyOtp from "../pages/VerifyOtp"
import PatientLogin from "../pages/PatientLogin"
import AdminLogin from "../pages/AdminLogin"

export const AuthRoutes = (
    <>
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
    </>
)
