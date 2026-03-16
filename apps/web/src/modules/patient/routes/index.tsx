import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import PatientDashboard from "../pages/PatientDashboard"
import PatientProfile from "../pages/PatientProfile"

export const PatientRoutes = (
    <>
        <Route
            path="/patient/dashboard"
            element={
                <ProtectedRoute role="PATIENT">
                    <PatientDashboard />
                </ProtectedRoute>
            }
        />

        <Route
            path="/patient/profile"
            element={
                <ProtectedRoute role="PATIENT">
                    <PatientProfile />
                </ProtectedRoute>
            }
        />

    </>
)
