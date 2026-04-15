import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import { UserRole } from "@/domain/auth/types/auth.types"
import AdminDashboard from "../pages/AdminDashboard"
import StaffDirectory from "../pages/StaffDirectory"
import PatientDirectory from "../pages/PatientDirectory"
import PatientDetailsPage from "../pages/PatientDetailsPage"
import AdminAppointments from "../pages/AdminAppointments"
import AdminSettings from "../pages/AdminSettings"

export const AdminRoutes = (
    <>
        <Route
            path="/admin/dashboard"
            element={
                <ProtectedRoute role={UserRole.ADMIN}>
                    <AdminDashboard />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/staff"
            element={
                <ProtectedRoute role={UserRole.ADMIN}>
                    <StaffDirectory />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/patients"
            element={
                <ProtectedRoute role={UserRole.ADMIN}>
                    <PatientDirectory />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/patients/:id"
            element={
                <ProtectedRoute role={UserRole.ADMIN}>
                    <PatientDetailsPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/appointments"
            element={
                <ProtectedRoute role={UserRole.ADMIN}>
                    <AdminAppointments />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/settings"
            element={
                <ProtectedRoute role={UserRole.ADMIN}>
                    <AdminSettings />
                </ProtectedRoute>
            }
        />
    </>
)
