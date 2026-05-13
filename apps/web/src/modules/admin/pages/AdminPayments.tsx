import { useState, useEffect } from "react"
import AdminSidebar from "../components/AdminSidebar"
import AdminTopNav from "../components/AdminTopNav"
import { DollarSign, CreditCard, Wallet, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
import { getAdminPaymentsList } from "@/infrastructure/api/admin.api"

export default function AdminPayments() {
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [statusFilter, setStatusFilter] = useState("")
    const [methodFilter, setMethodFilter] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const limit = 10

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPayments()
        }, 300)
        return () => clearTimeout(delayDebounceFn)
    }, [page, statusFilter, methodFilter, searchTerm])

    const fetchPayments = async () => {
        try {
            setLoading(true)
            const response = await getAdminPaymentsList({
                page,
                limit,
                status: statusFilter || undefined,
                paymentMethod: methodFilter || undefined,
                search: searchTerm || undefined
            })
            setPayments(response.data)
            setTotal(response.meta.total)
        } catch (error) {
            console.error("Failed to fetch payments:", error)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(total / limit)

    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            PAID: 'bg-green-50 text-green-700 border-green-100',
            PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
            FAILED: 'bg-red-50 text-red-700 border-red-100',
            REFUNDED: 'bg-blue-50 text-blue-700 border-blue-100',
        }
        return map[s] ?? 'bg-gray-50 text-gray-600 border-gray-100'
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            
            <main className="flex-1 ml-64 p-8">
                <AdminTopNav title="Financial Ledger" subtitle="Monitor and manage all clinic transactions and payments." />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {loading ? "Syncing..." : `Showing ${payments.length} of ${total} total transactions`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Filter className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-teal-600 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search by Patient, TX ID..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                className="pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all w-64 uppercase tracking-widest placeholder:text-gray-300"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${showFilters || statusFilter || methodFilter ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-100 text-gray-400'}`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Status</label>
                            <select 
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20"
                            >
                                <option value="">All Statuses</option>
                                <option value="PAID">Paid</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Method</label>
                            <select 
                                value={methodFilter}
                                onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20"
                            >
                                <option value="">All Methods</option>
                                <option value="STRIPE">Stripe</option>
                                <option value="PAYPAL">PayPal</option>
                                <option value="RAZORPAY">Razorpay</option>
                                <option value="WALLET">Wallet</option>
                            </select>
                        </div>
                        {(statusFilter || methodFilter) && (
                            <button 
                                onClick={() => { setStatusFilter(""); setMethodFilter(""); setPage(1); }}
                                className="self-end px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </button>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-50">
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Doctor</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-8 py-6 h-20 bg-white"></td>
                                        </tr>
                                    ))
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
                                                    <DollarSign className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="text-gray-400 font-bold text-sm">No transactions found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-gray-900">#{p.id.slice(-8).toUpperCase()}</p>
                                                {p.razorpayOrderId && <p className="text-[10px] font-medium text-gray-400">RZP: {p.razorpayOrderId.slice(-8)}</p>}
                                                {p.stripeSessionId && <p className="text-[10px] font-medium text-gray-400">STR: {p.stripeSessionId.slice(-8)}</p>}
                                                {p.paypalOrderId && <p className="text-[10px] font-medium text-gray-400">PP: {p.paypalOrderId.slice(-8)}</p>}
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-gray-900">{p.patient?.firstName} {p.patient?.lastName}</p>
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">{p.patient?.patientId}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-gray-900">Dr. {p.doctor?.firstName} {p.doctor?.lastName}</p>
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">{p.doctor?.specialization?.name}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-gray-900">₹{p.amount?.toLocaleString() ?? '0'}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">{p.currency}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {p.paymentMethod === 'RAZORPAY' ? <CreditCard className="w-4 h-4 text-blue-500" /> : <Wallet className="w-4 h-4 text-orange-500" />}
                                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{p.paymentMethod}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : 'N/A'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadge(p.status)}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
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
