import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import PatientDashboard from "../pages/PatientDashboard"
import PatientAppointments from "../pages/PatientAppointments"
import PatientProfile from "../pages/PatientProfile"
import FindDoctors from "../pages/FindDoctors"
import DoctorDetailsPage from "../pages/DoctorDetailsPage"
import BookingPage from "../pages/BookingPage"
import Prescriptions from "../pages/Prescriptions"
import PrescriptionDetail from "../pages/PrescriptionDetail"

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
            path="/patient/appointments"
            element={
                <ProtectedRoute role="PATIENT">
                    <PatientAppointments />
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

        <Route
            path="/patient/find-doctors"
            element={
                <ProtectedRoute role="PATIENT">
                    <FindDoctors />
                </ProtectedRoute>
            }
        />

        <Route
            path="/patient/doctor/:id"
            element={
                <ProtectedRoute role="PATIENT">
                    <DoctorDetailsPage />
                </ProtectedRoute>
            }
        />

        <Route
            path="/patient/book-appointment/:id"
            element={
                <ProtectedRoute role="PATIENT">
                    <BookingPage />
                </ProtectedRoute>
            }
        />

        <Route
            path="/patient/prescriptions"
            element={
                <ProtectedRoute role="PATIENT">
                    <Prescriptions />
                </ProtectedRoute>
            }
        />

        <Route
            path="/patient/prescriptions/:appointmentId"
            element={
                <ProtectedRoute role="PATIENT">
                    <PrescriptionDetail />
                </ProtectedRoute>
            }
        />
    </>
)

