import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import AdminDashboard from "../pages/AdminDashboard"

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
    </>
)
