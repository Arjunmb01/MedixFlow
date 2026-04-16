import { Route } from "react-router-dom"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import { UserRole } from "@/domain/auth/types/auth.types"
import PatientDashboard from "../pages/PatientDashboard"
import PatientAppointments from "../pages/PatientAppointments"
import PatientProfile from "../pages/PatientProfile"
import FindDoctors from "../pages/FindDoctors"
import DoctorDetailsPage from "../pages/DoctorDetailsPage"
import BookingPage from "../pages/BookingPage"
import WalletPage from "../pages/WalletPage"
import Prescriptions from "../pages/Prescriptions"
import PrescriptionDetail from "../pages/PrescriptionDetail"

export const PatientRoutes = (
    <>
        <Route
            path="/dashboard"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <PatientDashboard />
                </ProtectedRoute>
            }
        />

        <Route
            path="/wallet"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <WalletPage />
                </ProtectedRoute>
            }
        />

        <Route
            path="/appointments"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <PatientAppointments />
                </ProtectedRoute>
            }
        />

        <Route
            path="/prescriptions"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <Prescriptions />
                </ProtectedRoute>
            }
        />

        <Route
            path="/prescriptions/:appointmentId"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <PrescriptionDetail />
                </ProtectedRoute>
            }
        />

        <Route
            path="/profile"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <PatientProfile />
                </ProtectedRoute>
            }
        />

        <Route
            path="/find-doctors"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <FindDoctors />
                </ProtectedRoute>
            }
        />

        <Route
            path="/find-doctors/:id"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <DoctorDetailsPage />
                </ProtectedRoute>
            }
        />

        <Route
            path="/book-appointment/:id"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <BookingPage />
                </ProtectedRoute>
            }
        />


    </>
)

