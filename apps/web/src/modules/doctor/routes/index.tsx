import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import DoctorDashboard from "../pages/DoctorDashboard"
import DoctorProfile from "../pages/DoctorProfile"
import DoctorAppointments from "../pages/DoctorAppointments"
import DoctorQueue from "../pages/DoctorQueue"
import ConsultationWorkspace from "../pages/ConsultationWorkspace"
import DoctorPatients from "../pages/DoctorPatients"
import DoctorPrescriptions from "../pages/DoctorPrescriptions"

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
        {/* Specialized Consultation Module Routes */}
        <Route path="/doctor/queue" element={<ProtectedRoute role="DOCTOR"><DoctorQueue /></ProtectedRoute>} />
        <Route path="/doctor/workspace/:id" element={<ProtectedRoute role="DOCTOR"><ConsultationWorkspace /></ProtectedRoute>} />
        
        <Route path="/doctor/patients" element={<ProtectedRoute role="DOCTOR"><DoctorPatients /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute role="DOCTOR"><DoctorPrescriptions /></ProtectedRoute>} />

        {/* Placeholder routes for future implementation */}
        <Route path="/doctor/calendar" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/messages" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
    </>
)

