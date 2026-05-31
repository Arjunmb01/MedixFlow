import { Route } from "react-router-dom"
import { lazy } from "react"
import ProtectedRoute from "@/core/routes/ProtectedRoute"
import { UserRole } from "@/domain/auth/types/auth.types"

const PatientDashboard = lazy(() => import("../pages/PatientDashboard"))
const PatientAppointments = lazy(() => import("../pages/PatientAppointments"))
const PatientProfile = lazy(() => import("../pages/PatientProfile"))
const FindDoctors = lazy(() => import("../pages/FindDoctors"))
const DoctorDetailsPage = lazy(() => import("../pages/DoctorDetailsPage"))
const BookingPage = lazy(() => import("../pages/BookingPage"))
const WalletPage = lazy(() => import("../pages/WalletPage"))
const Prescriptions = lazy(() => import("../pages/Prescriptions"))
const PrescriptionDetail = lazy(() => import("../pages/PrescriptionDetail"))
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"))
const PaymentFailure = lazy(() => import("../pages/PaymentFailure"))
const PaymentCancel = lazy(() => import("../pages/PaymentCancel"))
const BillingPage = lazy(() => import("../pages/BillingPage"))
const PatientVideoConsultationPage = lazy(
    () => import("../../consultation/pages/PatientVideoConsultationPage")
)

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

        <Route
            path="/payment/success"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <PaymentSuccess />
                </ProtectedRoute>
            }
        />

        <Route
            path="/payment/failure"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <PaymentFailure />
                </ProtectedRoute>
            }
        />

        <Route
            path="/payment/cancel"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <PaymentCancel />
                </ProtectedRoute>
            }
        />

        <Route
            path="/billing"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <BillingPage />
                </ProtectedRoute>
            }
        />

        <Route
            path="/consultation/video/:appointmentId"
            element={
                <ProtectedRoute role={UserRole.PATIENT}>
                    <PatientVideoConsultationPage />
                </ProtectedRoute>
            }
        />
    </>
)

