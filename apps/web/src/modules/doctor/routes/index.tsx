import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import DoctorDashboard from "../pages/DoctorDashboard"
import DoctorProfile from "../pages/DoctorProfile"
import DoctorAppointments from "../pages/DoctorAppointments"

export const DoctorRoutes = (
    <>
        <Route
            path="/doctor/dashboard"
            element={
                <ProtectedRoute role="DOCTOR">
                    <DoctorDashboard />
                </ProtectedRoute>
            }
        />
        <Route
            path="/doctor/profile"
            element={
                <ProtectedRoute role="DOCTOR">
                    <DoctorProfile />
                </ProtectedRoute>
            }
        />
        <Route
            path="/doctor/appointments"
            element={
                <ProtectedRoute role="DOCTOR">
                    <DoctorAppointments />
                </ProtectedRoute>
            }
        />
        {/* Placeholder routes for future implementation */}
        <Route path="/doctor/queue" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/calendar" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/messages" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
    </>
)
