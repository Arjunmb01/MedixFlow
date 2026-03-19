import { Route } from "react-router-dom"
import GuestRoute from "@/core/routes/GuestRoute"
import Register from "../pages/Register"
import VerifyOtp from "../pages/VerifyOtp"
import PatientLogin from "../pages/PatientLogin"
import AdminLogin from "../pages/AdminLogin"
import DoctorLogin from "../pages/DoctorLogin"
import SetPassword from "../pages/SetPassword"
import ForgotPassword from "../pages/ForgotPassword"
import ResetPassword from "../pages/ResetPassword"

export const AuthRoutes = (
    <>
        {/* Generic routes */}
        <Route path="/setup-password" element={<SetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Role-specific reset routes for better UX/targeting */}
        <Route path="/doctor/forgot-password" element={<ForgotPassword />} />
        <Route path="/doctor/reset-password" element={<ResetPassword />} />

        <Route path="/auth/register" element={
            <GuestRoute forRole="PATIENT">
                <Register />
            </GuestRoute>
        } />
        <Route path="/auth/verify-otp" element={
            <GuestRoute forRole="PATIENT">
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
        <Route path="/doctor/login" element={
            <GuestRoute forRole="DOCTOR">
                <DoctorLogin />
            </GuestRoute>
        } />
    </>
)
