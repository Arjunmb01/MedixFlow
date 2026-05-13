import { useState, useEffect, useCallback } from "react"
import AdminSidebar from "../components/AdminSidebar"
import AdminTopNav from "../components/AdminTopNav"
import {
    Search,
    ClipboardList,
    Check,
    X,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    UserRound,
} from "lucide-react"
import { getAllLeaves, reviewLeave, type LeaveRequest, LEAVE_TYPES } from "@/infrastructure/api/leave.api"
import { toast } from "sonner"

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        PENDING: "bg-amber-50 text-amber-700 border-amber-100",
        APPROVED: "bg-green-50 text-green-700 border-green-100",
        REJECTED: "bg-red-50 text-red-700 border-red-100",
    }
    return map[s] ?? "bg-gray-50 text-gray-600 border-gray-100"
}

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const ITEMS_PER_PAGE = 10

export default function AdminLeaveManagement() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [reviewing, setReviewing] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [page, setPage] = useState(1)

    const fetchLeaves = useCallback(async () => {
        try {
            setLoading(true)
            const params = {
                page,
                limit: ITEMS_PER_PAGE,
                status: statusFilter === "ALL" ? undefined : statusFilter,
                search: search || undefined
            }
            const data = await getAllLeaves(params)
            setLeaves(data.data)
            setTotal(data.total)
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load leave requests.")
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search])

    const [total, setTotal] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeaves()
        }, 300)
        return () => clearTimeout(timer)
    }, [fetchLeaves])

    const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
        try {
            setReviewing(id)
            const updated = await reviewLeave(id, status)
            setLeaves(prev => prev.map(l => (l.id === id ? updated : l)))
            toast.success(`Leave request ${status.toLowerCase()} successfully.`)
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update leave request.")
        } finally {
            setReviewing(null)
        }
    }

    const paginated = leaves;

    const counts = {
        PENDING: leaves.filter(l => l.status === 'PENDING').length,
        APPROVED: leaves.filter(l => l.status === "APPROVED").length,
        REJECTED: leaves.filter(l => l.status === "REJECTED").length
    }

    return ( 
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />

            <main className="flex-1 ml-64 p-8">
                <AdminTopNav title="Leave Management" subtitle="Review and manage doctor leave requests." />

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Pending", count: counts.PENDING, color: "amber", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", dot: "bg-amber-400" },
                        { label: "Approved", count: counts.APPROVED, color: "green", bg: "bg-green-50", text: "text-green-700", border: "border-green-100", dot: "bg-green-400" },
                        { label: "Rejected", count: counts.REJECTED, color: "red", bg: "bg-red-50", text: "text-red-700", border: "border-red-100", dot: "bg-red-400" },
                    ].map(card => (
                        <div key={card.label} className={`${card.bg} border ${card.border} rounded-2xl p-5 flex items-center justify-between`}>
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest ${card.text}`}>{card.label}</p>
                                <p className={`text-3xl font-black ${card.text} mt-1`}>{loading ? "—" : card.count}</p>
                            </div>
                            <span className={`w-3 h-3 rounded-full ${card.dot}`} />
                        </div>
                    ))}
                </div>

                {/* Header + Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">All Leave Requests</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {loading ? "Loading..." : `Showing ${leaves.length} request${leaves.length !== 1 ? "s" : ""} of ${total}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by doctor name..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1) }}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/20 w-64 transition-all font-medium shadow-sm"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm outline-none"
                        >
                            {STATUS_FILTERS.map(s => (
                                <option key={s} value={s}>
                                    {s === "ALL" ? "All Statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Doctor</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Leave Period</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Reason</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Applied On</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-8 py-6 h-20 bg-gray-50/30" />
                                        </tr>
                                    ))
                                ) : paginated.length > 0 ? (
                                    paginated.map(leave => (
                                        <tr key={leave.id} className="group hover:bg-teal-50/30 transition-all">
                                            {/* Doctor */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100 flex-shrink-0">
                                                        <UserRound className="w-5 h-5 text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">
                                                            {leave.doctorName ?? `Dr. #${leave.doctorId.slice(-6)}`}
                                                        </p>
                                                        {leave.doctorEmail && (
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase">
                                                                {leave.doctorEmail}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Leave Type */}
                                            <td className="px-8 py-5">
                                                {(() => {
                                                    const t = LEAVE_TYPES.find(lt => lt.value === leave.leaveType)
                                                    return t ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-[11px] font-black">
                                                            {t.emoji} {t.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs font-bold">—</span>
                                                    )
                                                })()}
                                            </td>

                                            {/* Leave Period */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {formatDate(leave.startDate)}
                                                        {leave.startDate !== leave.endDate && (
                                                            <> → {formatDate(leave.endDate)}</>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Reason */}
                                            <td className="px-8 py-5">
                                                <p className="text-sm text-gray-600 font-medium max-w-[200px] truncate" title={leave.reason}>
                                                    {leave.reason}
                                                </p>
                                            </td>

                                            {/* Applied On */}
                                            <td className="px-8 py-5">
                                                <p className="text-sm text-gray-500 font-medium">{formatDate(leave.createdAt)}</p>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadge(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-8 py-5">
                                                {leave.status === "PENDING" ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleReview(leave.id, "APPROVED")}
                                                            disabled={reviewing === leave.id}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-black hover:bg-green-100 transition-all disabled:opacity-50"
                                                        >
                                                            {reviewing === leave.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Check className="w-3.5 h-3.5" />
                                                            )}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReview(leave.id, "REJECTED")}
                                                            disabled={reviewing === leave.id}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-black hover:bg-red-100 transition-all disabled:opacity-50"
                                                        >
                                                            {reviewing === leave.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <X className="w-3.5 h-3.5" />
                                                            )}
                                                            Reject
                                                        </button>
                                                    </div>
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
                                                    <ClipboardList className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="text-gray-400 font-black text-sm uppercase tracking-widest">
                                                    No leave requests found
                                                </p>
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

                    {/* Pagination */}
                    {(() => {
                        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
                        if (totalPages <= 1) return null;
                        return (
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
                    )
                })()}
                </div>
            </main>
        </div>
    )
}
