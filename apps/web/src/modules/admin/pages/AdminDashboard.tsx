import { useState, useEffect } from "react"
import AdminSidebar from "../components/AdminSidebar"
import AdminTopNav from "../components/AdminTopNav"
import StatCard from "@/modules/patient/components/ui/StatCard"
import DashboardChart from "../components/DashboardChart"
import StaffActivityTable from "../components/StaffActivityTable"
import PendingAbsences from "../components/PendingAbsences"
import { Users, UserPlus, Calendar, DollarSign, ArrowUpRight } from "lucide-react"
import { getAdminStats } from "@/infrastructure/api/patient.api"

export default function AdminDashboard() {
    const [stats, setStats] = useState({ patientCount: 0, doctorCount: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats()
                setStats(data)
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            
            <main className="flex-1 ml-64 p-8">
                <AdminTopNav 
                    title="Executive Dashboard" 
                    subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} - Executive Summary`} 
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard 
                        label="TOTAL PATIENTS"
                        value={loading ? "..." : (stats?.patientCount ?? 0).toLocaleString()}
                        icon={<Users className="w-5 h-5 text-teal-600" />}
                        iconBg="bg-teal-50"
                        subtitle={<span className="text-green-600 flex items-center gap-1 font-bold"><ArrowUpRight className="w-3 h-3" /> 12.4% vs last mo</span>}
                    />
                    <StatCard 
                        label="ACTIVE DOCTORS"
                        value={loading ? "..." : (stats?.doctorCount ?? 0).toLocaleString()}
                        icon={<UserPlus className="w-5 h-5 text-teal-600" />}
                        iconBg="bg-teal-50"
                        subtitle={<span className="text-gray-400 font-medium">Synced from Database</span>}
                    />
                    <StatCard 
                        label="TODAY'S VISITS"
                        value="314"
                        icon={<Calendar className="w-5 h-5 text-teal-600" />}
                        iconBg="bg-teal-50"
                        subtitle={<span className="text-green-600 font-bold">Current Volume</span>}
                    />
                    <StatCard 
                        label="MONTHLY REVENUE"
                        value="₹142,500"
                        icon={<DollarSign className="w-5 h-5 text-teal-600" />}
                        iconBg="bg-teal-50"
                        subtitle={<span className="text-green-600 flex items-center gap-1 font-bold"><ArrowUpRight className="w-3 h-3" /> 18.2% YoY Growth</span>}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
                    <div className="lg:col-span-7">
                        <DashboardChart 
                            title="PATIENT GROWTH TREND (Q3)" 
                            type="line" 
                        />
                    </div>
                    <div className="lg:col-span-5">
                        <DashboardChart 
                            title="REVENUE ACCRUAL (LAST 7 DAYS)" 
                            type="bar" 
                        />
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <StaffActivityTable />
                    </div>
                    <div className="lg:col-span-4">
                        <PendingAbsences />
                    </div>
                </div>
            </main>
        </div>
    )
}