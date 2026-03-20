import StatCard from "@/modules/patient/components/ui/StatCard"
import UpcomingCareCard from "@/modules/patient/components/dashboard/UpcomingCareCard"
import NotificationPanel from "@/modules/patient/components/dashboard/NotificationPanel"
import Sidebar from "@/modules/patient/components/dashboard/Sidebar"
import TopNav from "@/modules/patient/components/dashboard/TopNav"
import AppointmentHistory from "@/modules/patient/components/dashboard/AppointmentHistory"
import DownloadCenter from "@/modules/patient/components/dashboard/DownloadCenter"
import BillingSummary from "@/modules/patient/components/dashboard/BillingSummary"

import { Calendar, ClipboardList, UserCircle, FileText } from "lucide-react"
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile"

export default function PatientDashboard() {
    const { profile, loading } = usePatientProfile()

    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const userName = profile.name || "Patient"

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-64">
                <TopNav 
                    userName={userName} 
                    patientId={profile.patientId || "PX-202"} 
                />

                <main className="pt-28 pb-12 px-8">
                    {/* Welcome Header */}
                    <div className="mb-10">
                        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">
                            Welcome back, {userName.split(' ')[0]} 👋
                        </h1>
                        <p className="text-[16px] font-medium text-gray-500 mt-2">
                            Here's your health overview today.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-6 mb-10">
                        <StatCard
                            icon={<Calendar className="w-5 h-5 text-red-500" />}
                            iconBg="bg-red-50"
                            value="01"
                            label="Upcoming Appointments"
                            subtitle={<span className="text-gray-400">Tomorrow 10:30 AM</span>}
                        />
                        <StatCard
                            icon={<ClipboardList className="w-5 h-5 text-green-500" />}
                            iconBg="bg-green-50"
                            value="02"
                            label="Pending Follow-ups"
                            subtitle={<span className="text-red-500 font-bold">Action required</span>}
                        />
                        <StatCard
                            icon={<UserCircle className="w-5 h-5 text-blue-500" />}
                            iconBg="bg-blue-50"
                            value={`${profile.profileCompletion}%`}
                            label="Profile Completion"
                            subtitle={<button className="text-blue-600 font-bold hover:underline">add emergency contact</button>}
                        />
                        <StatCard
                            icon={<FileText className="w-5 h-5 text-gray-500" />}
                            iconBg="bg-gray-50"
                            value="12"
                            label="Medical Records"
                            subtitle={<span className="text-gray-400">last uploaded 2 days ago</span>}
                        />
                    </div>

                    {/* Main Content Sections */}
                    <div className="grid grid-cols-3 gap-8 mb-10">
                        <div className="col-span-2">
                            <UpcomingCareCard />
                        </div>
                        <div className="col-span-1">
                            <NotificationPanel />
                        </div>
                    </div>

                    {/* Bottom Sections */}
                    <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-1">
                            <AppointmentHistory />
                        </div>
                        <div className="col-span-1">
                            <DownloadCenter />
                        </div>
                        <div className="col-span-1">
                            <BillingSummary />
                        </div>
                    </div>
                </main>

                {/* Floating Action Button
                <button className="fixed bottom-10 right-10 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-400 hover:scale-110 transition-transform z-20 group">
                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </button> */}
            </div>
        </div>
    )
}