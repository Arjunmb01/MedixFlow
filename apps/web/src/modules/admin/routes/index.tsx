import { Route } from "react-router-dom"
import { lazy } from "react"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import { UserRole } from "@/domain/auth/types/auth.types"

const AdminDashboard = lazy(() => import("../pages/AdminDashboard"))
const StaffDirectory = lazy(() => import("../pages/StaffDirectory"))
const PatientDirectory = lazy(() => import("../pages/PatientDirectory"))
const PatientDetailsPage = lazy(() => import("../pages/PatientDetailsPage"))
const AdminAppointments = lazy(() => import("../pages/AdminAppointments"))
const AdminSettings = lazy(() => import("../pages/AdminSettings"))
const AdminLeaveManagement = lazy(() => import("../pages/AdminLeaveManagement"))
const AdminPayments = lazy(() => import("../pages/AdminPayments"))

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
            path="/admin/payments"
            element={
                <ProtectedRoute role={UserRole.ADMIN}>
                    <AdminPayments />
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
            path="/admin/leaves"
            element={
                <ProtectedRoute role={UserRole.ADMIN}>
                    <AdminLeaveManagement />
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
