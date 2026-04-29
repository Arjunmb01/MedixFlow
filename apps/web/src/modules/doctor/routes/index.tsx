import { Route } from "react-router-dom"
import { lazy } from "react"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import { UserRole } from "@/domain/auth/types/auth.types"

const DoctorDashboard = lazy(() => import("../pages/DoctorDashboard"))
const DoctorProfile = lazy(() => import("../pages/DoctorProfile"))
const DoctorAppointments = lazy(() => import("../pages/DoctorAppointments"))
const DoctorQueue = lazy(() => import("../pages/DoctorQueue"))
const ConsultationWorkspace = lazy(() => import("../pages/ConsultationWorkspace"))
const DoctorPatients = lazy(() => import("../pages/DoctorPatients"))
const DoctorPrescriptions = lazy(() => import("../pages/DoctorPrescriptions"))
const DoctorLeave = lazy(() => import("../pages/DoctorLeave"))

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

