import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import AdminDashboard from "../pages/AdminDashboard"
import StaffDirectory from "../pages/StaffDirectory"
import PatientDirectory from "../pages/PatientDirectory"
import PatientDetailsPage from "../pages/PatientDetailsPage"

export const AdminRoutes = (
    <>
        <Route
            path="/admin/dashboard"
            element={
                <ProtectedRoute role="ADMIN">
                    <AdminDashboard />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/staff"
            element={
                <ProtectedRoute role="ADMIN">
                    <StaffDirectory />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/patients"
            element={
                <ProtectedRoute role="ADMIN">
                    <PatientDirectory />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/patients/:id"
            element={
                <ProtectedRoute role="ADMIN">
                    <PatientDetailsPage />
                </ProtectedRoute>
            }
        />
    </>
)
