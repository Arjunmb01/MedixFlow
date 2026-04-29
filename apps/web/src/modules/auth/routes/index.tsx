import { Route } from "react-router-dom"
import { lazy } from "react"
import GuestRoute from "@/core/routes/GuestRoute"
import { UserRole } from "../types/auth.types"

const Register = lazy(() => import("../pages/Register"))
const VerifyOtp = lazy(() => import("../pages/VerifyOtp"))
const PatientLogin = lazy(() => import("../pages/PatientLogin"))
const AdminLogin = lazy(() => import("../pages/AdminLogin"))
const DoctorLogin = lazy(() => import("../pages/DoctorLogin"))
const SetPassword = lazy(() => import("../pages/SetPassword"))
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"))
const ResetPassword = lazy(() => import("../pages/ResetPassword"))

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
            <GuestRoute forRole={UserRole.PATIENT}>
                <Register />
            </GuestRoute>
        } />
        <Route path="/auth/verify-otp" element={
            <GuestRoute forRole={UserRole.PATIENT}>
                <VerifyOtp />
            </GuestRoute>
        } />
        <Route path="/patient/login" element={
            <GuestRoute forRole={UserRole.PATIENT}>
                <PatientLogin />
            </GuestRoute>
        } />
        <Route path="/admin/login" element={
            <GuestRoute forRole={UserRole.ADMIN}>
                <AdminLogin />
            </GuestRoute>
        } />
        <Route path="/doctor/login" element={
            <GuestRoute forRole={UserRole.DOCTOR}>
                <DoctorLogin />
            </GuestRoute>
        } />
    </>
)
