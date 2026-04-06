import { useState, useEffect } from "react"
import AdminSidebar from "../components/AdminSidebar"
import AdminTopNav from "../components/AdminTopNav"
import { Search, Calendar, User, Stethoscope, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { getAdminAppointments } from "@/infrastructure/api/admin.api"
import type { Appointment } from "@/domain/appointment/types"

const STATUS_OPTIONS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("ALL")
    const [page, setPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const data = await getAdminAppointments()
            setAppointments(data)
        } catch (error) {
            console.error("Failed to fetch appointments:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = 
            `${apt.patient.firstName} ${apt.patient.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
            `${apt.doctor.firstName} ${apt.doctor.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
            apt.id.toLowerCase().includes(search.toLowerCase())
        
        const matchesStatus = status === "ALL" || apt.status === status
        
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
    const paginatedAppointments = filteredAppointments.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }


    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            CONFIRMED: 'bg-green-50 text-green-700 border-green-100',
            PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
            COMPLETED: 'bg-blue-50 text-blue-700 border-blue-100',
            CANCELLED: 'bg-red-50 text-red-700 border-red-100',
        }
        return map[s] ?? 'bg-gray-50 text-gray-600 border-gray-100'
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            
            <main className="flex-1 ml-64 p-8">
                <AdminTopNav title="Appointments Directory" subtitle="Manage and monitor all clinic appointments." />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">All Appointments</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {loading ? "Loading..." : `Showing ${filteredAppointments.length} total appointments`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search patient, doctor or ID..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/20 w-72 transition-all font-medium shadow-sm"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm outline-none"
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt === "ALL" ? "All Statuses" : opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">ID / Date</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Doctor</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Time Slot</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6 h-20 bg-gray-50/30"></td>
                                        </tr>
                                    ))
                                ) : paginatedAppointments.length > 0 ? (
                                    paginatedAppointments.map((apt) => (
                                        <tr key={apt.id} className="group hover:bg-teal-50/30 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900 text-sm">#{apt.id.slice(-6).toUpperCase()}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(apt.appointmentDate)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{apt.patient.firstName} {apt.patient.lastName}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{apt.patient.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
                                                        <Stethoscope className="w-5 h-5 text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">Dr. {apt.doctor.firstName} {apt.doctor.lastName}</p>
                                                        <p className="text-[10px] font-bold text-teal-600 uppercase">{apt.doctor.specialization?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-700">{apt.slotStart} - {apt.slotEnd}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadge(apt.status)}`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-2">
                                                    <Calendar className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No appointments found</p>
                                                {(search || status !== "ALL") && (
                                                    <button 
                                                        onClick={() => { setSearch(""); setStatus("ALL") }}
                                                        className="text-teal-600 font-black text-[10px] uppercase tracking-widest hover:underline mt-2"
                                                    >
                                                        Reset Filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Page <span className="text-gray-900">{page}</span> of <span className="text-gray-900">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
