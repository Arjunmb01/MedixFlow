import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import { UserRole } from "@/domain/auth/types/auth.types"
import DoctorDashboard from "../pages/DoctorDashboard"
import DoctorProfile from "../pages/DoctorProfile"
import DoctorAppointments from "../pages/DoctorAppointments"
import DoctorQueue from "../pages/DoctorQueue"
import ConsultationWorkspace from "../pages/ConsultationWorkspace"
import DoctorPatients from "../pages/DoctorPatients"
import DoctorPrescriptions from "../pages/DoctorPrescriptions"
import DoctorLeave from "../pages/DoctorLeave"

export const DoctorRoutes = (
    <>
        <Route
            path="/doctor/dashboard"
            element={
                <ProtectedRoute role={UserRole.DOCTOR}>
                    <DoctorDashboard />
                </ProtectedRoute>
            }
        />
        <Route
            path="/doctor/profile"
            element={
                <ProtectedRoute role={UserRole.DOCTOR}>
                    <DoctorProfile />
                </ProtectedRoute>
            }
        />
        <Route
            path="/doctor/appointments"
            element={
                <ProtectedRoute role={UserRole.DOCTOR}>
                    <DoctorAppointments />
                </ProtectedRoute>
            }
        />
        {/* Specialized Consultation Module Routes */}
        <Route path="/doctor/queue" element={<ProtectedRoute role={UserRole.DOCTOR}><DoctorQueue /></ProtectedRoute>} />
        <Route path="/doctor/workspace/:id" element={<ProtectedRoute role={UserRole.DOCTOR}><ConsultationWorkspace /></ProtectedRoute>} />
        
        <Route path="/doctor/patients" element={<ProtectedRoute role={UserRole.DOCTOR}><DoctorPatients /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute role={UserRole.DOCTOR}><DoctorPrescriptions /></ProtectedRoute>} />
        <Route path="/doctor/leave" element={<ProtectedRoute role={UserRole.DOCTOR}><DoctorLeave /></ProtectedRoute>} />

        {/* Placeholder routes for future implementation */}
        <Route path="/doctor/calendar" element={<ProtectedRoute role={UserRole.DOCTOR}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/messages" element={<ProtectedRoute role={UserRole.DOCTOR}><DoctorDashboard /></ProtectedRoute>} />
    </>
)

