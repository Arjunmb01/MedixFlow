import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import GuestRoute from "@/core/routes/GuestRoute";

import { AuthRoutes } from "@/modules/auth/routes";
import { PatientRoutes } from "@/modules/patient/routes";
import { AdminRoutes } from "@/modules/admin/routes";
import { DoctorRoutes } from "@/modules/doctor/routes";
import ProtectedRoute from "@/core/routes/ProtectedRoute";
import { UserRole } from "@/domain/auth/types/auth.types";

const LandingPage = lazy(() => import("@/modules/landing/pages/LandingPage"));
const NotificationsPage = lazy(() => import("@/modules/shared/pages/NotificationsPage"));
const NotFoundPage = lazy(() => import("@/core/pages/NotFoundPage"));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
    <div className="w-10 h-10 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function AppRoutes() {
<<<<<<< HEAD
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <GuestRoute>
                <LandingPage />
              </GuestRoute>
            }
          />
          {AuthRoutes}
          {PatientRoutes}
          {AdminRoutes}
          {DoctorRoutes}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute role={[UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
=======
    return (
        <BrowserRouter>
            <Suspense fallback={
                <div className="flex h-screen items-center justify-center bg-[#F8FAFC]" role="status" aria-label="Loading MedixFlow">
                    <div className="w-10 h-10 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                    <span className="sr-only">Loading...</span>
                </div>
            }>
                <Routes>
                    <Route path="/" element={
                        <GuestRoute>
                            <LandingPage />
                        </GuestRoute>
                    } />
                    {AuthRoutes}
                    {PatientRoutes}
                    {AdminRoutes}
                    {DoctorRoutes}
                    <Route path="/notifications" element={
                        <ProtectedRoute role={[UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]}>
                            <NotificationsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
