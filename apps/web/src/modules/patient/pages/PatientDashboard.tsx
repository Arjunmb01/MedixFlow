import StatCard from "@/modules/patient/components/ui/StatCard"
import UpcomingCareCard from "@/modules/patient/components/dashboard/UpcomingCareCard"
import Sidebar from "@/modules/patient/components/dashboard/Sidebar"
import TopNav from "@/modules/patient/components/dashboard/TopNav"
import AppointmentHistory from "@/modules/patient/components/dashboard/AppointmentHistory"
import DownloadCenter from "@/modules/patient/components/dashboard/DownloadCenter"
import BillingSummary from "@/modules/patient/components/dashboard/BillingSummary"

import { Calendar, UserCircle, FileText, Loader2 } from "lucide-react"
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile"
import { usePatientDashboard } from "@/application/patient/hooks/usePatientDashboard"

export default function PatientDashboard() {
    const { profile, loading: profileLoading } = usePatientProfile()
    const { stats, loading: dashboardLoading } = usePatientDashboard()

    if (profileLoading || dashboardLoading || !profile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 flex-col font-outfit">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="mt-4 text-gray-500 font-bold">Loading dashboard...</p>
            </div>
        )
    }

    const userName = profile.name || "Patient"

    // ✅ FIXED MAPPING (CRITICAL)
    const mappedAppointment = stats?.nextAppointment
        ? {
              id: stats.nextAppointment.id,
              doctorName: stats.nextAppointment.doctorName,
              date: stats.nextAppointment.date,
              slotStart: stats.nextAppointment.slotStart,
<<<<<<< HEAD
              consultationType: stats.nextAppointment.consultationType,
=======
              hasConsultation: !!stats.nextAppointment.hasConsultation,
              status: stats.nextAppointment.status
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
          }
        : null

    return (
        <div className="min-h-screen bg-gray-50 flex font-outfit">
            <Sidebar />

            <div className="flex-1 ml-64">
                <TopNav 
                    userName={userName} 
                    patientId={profile.patientId || "PX-202"} 
                />

                <main className="pt-28 pb-12 px-8">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-[32px] font-bold text-gray-900">
                            Welcome back, {userName.split(' ')[0]} 👋
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Here's your health overview today.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mb-10">
                        <StatCard
                            icon={<Calendar className="w-5 h-5 text-red-500" />}
                            iconBg="bg-red-50"
                            value={stats?.upcomingAppointmentsCount || 0}
                            label="Upcoming Appointments"
                            subtitle={
                                <span className="text-gray-400">
                                    {stats?.nextAppointment
                                        ? stats.nextAppointment.slotStart
                                        : "No sessions scheduled"}
                                </span>
                            }
                        />

                        <StatCard
                            icon={<UserCircle className="w-5 h-5 text-blue-500" />}
                            iconBg="bg-blue-50"
                            value={`${stats?.profileCompletion || profile.profileCompletion}%`}
                            label="Profile Completion"
                            subtitle={<button className="text-blue-600 font-bold">Complete profile</button>}
                        />

                        <StatCard
                            icon={<FileText className="w-5 h-5 text-gray-500" />}
                            iconBg="bg-gray-50"
                            value={stats?.medicalRecordsCount || 0}
                            label="Medical Records"
                            subtitle={<span className="text-gray-400">Manage documents</span>}
                        />
                    </div>

                    {/* ✅ FIXED HERE */}
                    <div className="grid grid-cols-3 gap-8 mb-10">
                        <div className="col-span-3">
                            <UpcomingCareCard appointment={mappedAppointment} />
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <AppointmentHistory appointments={stats?.recentAppointments || []} />
                        </div>
                        <div>
                            <DownloadCenter />
                        </div>
                        <div>
                            <BillingSummary />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}