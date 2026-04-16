import { useState } from "react"
import DoctorSidebar from "../components/DoctorSidebar"
import DoctorTopNav from "../components/DoctorTopNav"
import { useDoctorLeave } from "@/application/doctor/hooks/useDoctorLeave"
import { useDoctorDashboard } from "@/application/doctor/hooks/useDoctorDashboard"
import { LEAVE_TYPES } from "@/infrastructure/api/leave.api"
import {
    CalendarOff,
    CalendarCheck,
    Clock3,
    XCircle,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2,
    Plus,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
} from "lucide-react"

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED"

const statusConfig: Record<LeaveStatus, { label: string; bg: string; text: string; icon: any }> = {
    PENDING: { label: "Pending",  bg: "bg-amber-50",   text: "text-amber-600",   icon: Clock3        },
    APPROVED:{ label: "Approved", bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle2  },
    REJECTED:{ label: "Rejected", bg: "bg-red-50",     text: "text-red-500",     icon: XCircle       },
}

const ITEMS_PER_PAGE = 5

export default function DoctorLeave() {
    const { profile } = useDoctorDashboard()
    const { leaves, loading, submitting, cancelling, submitLeave, deleteLeave, leaveBalance } = useDoctorLeave()

    const [showForm, setShowForm] = useState(false)
    const [page, setPage] = useState(1)
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        reason: "",
        leaveType: LEAVE_TYPES[0].value as string,
    })
    const [formError, setFormError] = useState("")

    const today = new Date().toISOString().split("T")[0]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")

        if (!formData.startDate || !formData.endDate) {
            setFormError("Please select both start and end dates.")
            return
        }
        if (formData.startDate > formData.endDate) {
            setFormError("End date must be after start date.")
            return
        }
        if (!formData.reason.trim() || formData.reason.trim().length < 5) {
            setFormError("Please provide a reason (minimum 5 characters).")
            return
        }
        if (!formData.leaveType) {
            setFormError("Please select a leave type.")
            return
        }

        const success = await submitLeave({
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason.trim(),
            leaveType: formData.leaveType as any,
        })

        if (success) {
            setFormData({ startDate: "", endDate: "", reason: "", leaveType: LEAVE_TYPES[0].value })
            setShowForm(false)
        }
    }

    const pendingCount  = leaves.filter((l) => l.status === "PENDING").length
    const approvedCount = leaves.filter((l) => l.status === "APPROVED").length
    const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length

    const totalPages = Math.max(1, Math.ceil(leaves.length / ITEMS_PER_PAGE))
    const paginated  = leaves.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const usedPct = Math.min(100, (leaveBalance.totalUsed / leaveBalance.total) * 100)

    return (
        <div className="flex min-h-screen bg-gray-50/50 font-outfit">
            <DoctorSidebar />

            <div className="flex-1 flex flex-col pl-64">
                <DoctorTopNav
                    doctorName={`Dr. ${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`}
                    doctorSpecialty={profile?.specialty}
                    avatarUrl={profile?.avatarUrl}
                />

                <main className="p-8 space-y-8">
                    {/* Page Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center">
                                    <CalendarOff className="w-5 h-5 text-white" />
                                </div>
                                Leave Management
                            </h1>
                            <p className="text-gray-500 font-medium pl-1">Submit and track your leave requests</p>
                        </div>

                        <button
                            onClick={() => setShowForm((v) => !v)}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-teal-100 transition-all active:scale-95"
                        >
                            {showForm ? <><ChevronUp className="w-4 h-4" /> Hide Form</> : <><Plus className="w-4 h-4" /> Apply for Leave</>}
                        </button>
                    </div>

                    {/* ── Annual Leave Balance ─────────────────────────────────── */}
                    <div className="bg-white rounded-[2rem] border border-teal-100 shadow-sm p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Annual Leave Balance</h2>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5">Based on approved leaves this year</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-teal-600">{leaveBalance.remaining}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">days remaining</p>
                            </div>
                        </div>

                        {/* Overall progress bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>{leaveBalance.totalUsed} used</span>
                                <span>{leaveBalance.total} total</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${usedPct}%`,
                                        background: usedPct >= 90 ? "#ef4444" : usedPct >= 70 ? "#f59e0b" : "#0d9488",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-3 gap-4">
                        <StatChip icon={Clock3}       label="Pending"  value={pendingCount}  color="amber"   />
                        <StatChip icon={CheckCircle2} label="Approved" value={approvedCount} color="emerald" />
                        <StatChip icon={XCircle}      label="Rejected" value={rejectedCount} color="red"     />
                    </div>

                    {/* Apply Form */}
                    {showForm && (
                        <div className="bg-white rounded-[2rem] border border-teal-100 shadow-xl shadow-teal-50 p-8 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                                    <CalendarCheck className="w-5 h-5 text-teal-600" />
                                </div>
                                <h2 className="text-lg font-black text-gray-900">New Leave Request</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Leave Type */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Leave Type</label>
                                    <select
                                        value={formData.leaveType}
                                        onChange={(e) => setFormData((d) => ({ ...d, leaveType: e.target.value }))}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-900 font-bold text-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all bg-gray-50/50"
                                    >
                                        {LEAVE_TYPES.map((lt) => (
                                            <option key={lt.value} value={lt.value}>
                                                 {lt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Start Date</label>
                                        <input
                                            type="date"
                                            min={today}
                                            value={formData.startDate}
                                            onChange={(e) => setFormData((d) => ({ ...d, startDate: e.target.value }))}
                                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-900 font-bold text-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">End Date</label>
                                        <input
                                            type="date"
                                            min={formData.startDate || today}
                                            value={formData.endDate}
                                            onChange={(e) => setFormData((d) => ({ ...d, endDate: e.target.value }))}
                                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-900 font-bold text-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Reason</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Briefly describe the reason for your leave..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData((d) => ({ ...d, reason: e.target.value }))}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-900 font-medium text-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all resize-none bg-gray-50/50"
                                    />
                                </div>

                                {formError && (
                                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {formError}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-teal-100 transition-all active:scale-95"
                                    >
                                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><CheckCircle2 className="w-4 h-4" /> Submit Request</>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); setFormError(""); setFormData({ startDate: "", endDate: "", reason: "", leaveType: LEAVE_TYPES[0].value }) }}
                                        className="px-8 py-3.5 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-100 transition-all"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Leave History */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Leave History</h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-gray-400 font-bold text-sm">Loading leave records...</p>
                            </div>
                        ) : leaves.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100 gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center">
                                    <CalendarOff className="w-8 h-8 text-gray-300" />
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-gray-900">No leave requests yet</p>
                                    <p className="text-gray-400 text-sm font-medium mt-1">Click "Apply for Leave" to submit your first request</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {paginated.map((leave) => {
                                    const cfg = statusConfig[leave.status as LeaveStatus]
                                    const StatusIcon = cfg.icon
                                    const isPending = leave.status === "PENDING"
                                    const start = new Date(leave.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                                    const end   = new Date(leave.endDate  ).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                                    const daysDiff = Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / 86_400_000) + 1
                                    const typeInfo = LEAVE_TYPES.find((t) => t.value === leave.leaveType)

                                    return (
                                        <div
                                            key={leave.id}
                                            className={`bg-white rounded-[1.5rem] border transition-all hover:shadow-lg hover:shadow-gray-100/60 p-6 flex items-start gap-5 ${
                                                isPending ? "border-amber-100" : leave.status === "APPROVED" ? "border-emerald-100" : "border-gray-100"
                                            }`}
                                        >
                                            {/* Status indicator */}
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                                                <StatusIcon className={`w-5 h-5 ${cfg.text}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                    <p className="font-black text-gray-900 text-sm">{start} — {end}</p>
                                                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border">
                                                        {daysDiff} {daysDiff === 1 ? "day" : "days"}
                                                    </span>
                                                    {typeInfo && (
                                                        <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                                                         {typeInfo.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">{leave.reason}</p>
                                                <p className="text-gray-400 text-[11px] font-bold mt-2 uppercase tracking-wide">
                                                    Submitted {new Date(leave.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                                </p>
                                            </div>

                                            {/* Status badge + action */}
                                            <div className="flex flex-col items-end gap-3 shrink-0">
                                                <span className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.text} border-current/10`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {cfg.label}
                                                </span>
                                                {isPending && (
                                                    <button
                                                        onClick={() => deleteLeave(leave.id)}
                                                        disabled={cancelling === leave.id}
                                                        className="flex items-center gap-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                    >
                                                        {cancelling === leave.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="bg-white rounded-[1.5rem] border border-gray-100 px-6 py-4 flex items-center justify-between mt-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Page <span className="text-gray-900">{page}</span> of <span className="text-gray-900">{totalPages}</span>
                                            <span className="ml-2 text-gray-300">·</span>
                                            <span className="ml-2">{leaves.length} total</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-100 disabled:opacity-30 transition-all"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPage(p)}
                                                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                                                            p === page
                                                                ? "bg-teal-600 text-white shadow-lg shadow-teal-100"
                                                                : "bg-gray-50 text-gray-400 hover:bg-teal-50 hover:text-teal-600 border border-gray-100"
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                                className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-100 disabled:opacity-30 transition-all"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

function StatChip({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: "amber" | "emerald" | "red" }) {
    const colors = {
        amber:   "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        red:     "bg-red-50 text-red-500 border-red-100",
    }
    return (
        <div className={`flex items-center gap-4 p-5 bg-white rounded-2xl border ${colors[color]} transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-100/50 cursor-default`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
            </div>
        </div>
    )
}
