import { useState, useEffect, useMemo } from "react"
import AdminSidebar from "../components/AdminSidebar"
import AdminTopNav from "../components/AdminTopNav"
import { Search, Calendar, User, Stethoscope, ChevronLeft, ChevronRight, Clock, CalendarClock } from "lucide-react"
import { getAdminAppointments } from "@/infrastructure/api/admin.api"
import type { Appointment } from "@/domain/appointment/types"
import { RescheduleModal } from "@/modules/shared/components/RescheduleModal"



export default function AdminAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [page, setPage] = useState(1)
    const [totalAppointments, setTotalAppointments] = useState(0)
    const [rescheduleApt, setRescheduleApt] = useState<any | null>(null)
    const itemsPerPage = 8

    useEffect(() => {
        fetchData()
    }, [page, statusFilter])

    const fetchData = async () => {
        try {
            setLoading(true)
            const params = {
                status: (statusFilter === "ALL" || statusFilter === "UPCOMING") ? undefined : statusFilter,
                isUpcoming: statusFilter === "UPCOMING" ? true : undefined,
                page,
                limit: itemsPerPage
            }
            const data = await getAdminAppointments(params)
            setAppointments(data.appointments)
            setTotalAppointments(data.total)
        } catch (error) {
            console.error("Failed to fetch appointments:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const matchesSearch =
                `${apt.patient.firstName} ${apt.patient.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                `${apt.doctor.firstName} ${apt.doctor.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                apt.id.toLowerCase().includes(search.toLowerCase())
            return matchesSearch
        })
    }, [appointments, search])


    const totalPages = Math.ceil(totalAppointments / itemsPerPage)


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
            NOT_ATTENDED: 'bg-slate-50 text-slate-500 border-slate-100',
        }
        return map[s] ?? 'bg-gray-50 text-gray-600 border-gray-100'
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50 font-outfit">
            <AdminSidebar />

            <main className="flex-1 ml-64 p-8">
                <AdminTopNav title="Appointments Directory" subtitle="Manage and monitor all clinic appointments." />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Ledger</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            {loading ? "Synchronizing..." : `Found ${totalAppointments} total records matching filters`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50 transition-all w-80 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-gray-100/50 p-1.5 rounded-[2rem] border border-gray-200/50 mb-10 w-fit overflow-x-auto no-scrollbar">
                    {[
                        { id: 'UPCOMING', label: 'Upcoming' },
                        { id: 'COMPLETED', label: 'Completed' },
                        { id: 'CANCELLED', label: 'Cancelled' },
                        { id: 'NOT_ATTENDED', label: 'Not Attended' },
                        { id: 'ALL', label: 'All Appointments' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                            className={`px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === tab.id
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
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
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-8 py-6 h-20 bg-gray-50/30"></td>
                                        </tr>
                                    ))
                                ) : filteredAppointments.length > 0 ? (
                                    filteredAppointments.map((apt) => (
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
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${apt.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                        <span className="text-[10px] font-black uppercase text-gray-700">{apt.paymentStatus || 'PENDING'}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-gray-900 leading-none">₹{apt.paymentAmount || 'N/A'}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {apt.transactionId?.slice(-8).toUpperCase() || apt.paymentMethod || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadge(apt.status)}`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {(apt.status === "PENDING" || apt.status === "CONFIRMED") ? (
                                                    <button
                                                        onClick={() => setRescheduleApt(apt)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-xl text-xs font-black hover:bg-violet-100 transition-all"
                                                    >
                                                        <CalendarClock className="w-3.5 h-3.5" />
                                                        Reschedule
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-300 font-bold uppercase tracking-widest">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-2">
                                                    <Calendar className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No appointments found</p>
                                                {(search || statusFilter !== "ALL") && (
                                                    <button
                                                        onClick={() => { setSearch(""); setStatusFilter("ALL") }}
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

            {/* Reschedule Modal */}
            {rescheduleApt && (
                <RescheduleModal
                    appointmentId={rescheduleApt.id}
                    doctorId={rescheduleApt.doctor?.id ?? rescheduleApt.doctorId}
                    role="admin"
                    onSuccess={fetchData}
                    onClose={() => setRescheduleApt(null)}
                />
            )}
        </div>
    )
}
