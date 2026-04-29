import { useState, useEffect } from "react"
import Sidebar from "../components/dashboard/Sidebar"
import TopNav from "../components/dashboard/TopNav"
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile"
import { getFinancialActivity } from "@/infrastructure/api/appointment.api"
import { motion } from "framer-motion"
import { Receipt, Download, Search, Filter, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet, ChevronLeft, ChevronRight } from "lucide-react"

export default function BillingPage() {
    const { profile } = usePatientProfile()
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [methodFilter, setMethodFilter] = useState("")
    const [dateRange, setDateRange] = useState({ from: "", to: "" })
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [showFilters, setShowFilters] = useState(false)
    const limit = 10

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchActivity()
        }, 300)
        return () => clearTimeout(delayDebounceFn)
    }, [page, filter, searchTerm, methodFilter, dateRange])

    const fetchActivity = async () => {
        try {
            setLoading(true)
            const data = await getFinancialActivity({
                page,
                limit,
                search: searchTerm || undefined,
                status: filter !== "all" ? filter.toUpperCase() : undefined,
                method: methodFilter || undefined,
                startDate: dateRange.from || undefined,
                endDate: dateRange.to || undefined
            })
            setActivities(data.data || [])
            setTotal(data.total || 0)
        } catch (error) {
            console.error("Failed to fetch billing history:", error)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(total / limit)

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "PAID": return "bg-emerald-50 text-emerald-600 border-emerald-100"
            case "PENDING": return "bg-amber-50 text-amber-600 border-amber-100"
            case "FAILED": return "bg-rose-50 text-rose-600 border-rose-100"
            case "PAYMENT_FAILED_HOLD": return "bg-rose-50 text-rose-600 border-rose-100"
            case "EXPIRED": return "bg-gray-100 text-gray-500 border-gray-200"
            default: return "bg-gray-50 text-gray-600 border-gray-100"
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-outfit">
            <Sidebar />

            <div className="flex-1 ml-64">
                <TopNav
                    userName={`${profile?.name}`}
                    patientId={profile?.patientId || "PX-202"}
                />

                <main className="pt-28 pb-12 px-8 max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="text-[34px] font-black text-[#0F172A] tracking-tight mb-2">Billing History</h1>
                            <p className="text-[#64748B] text-sm font-medium">Manage your payments, invoices and wallet transactions.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-black text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Spent</p>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">₹{activities.reduce((acc, curr) => acc + (curr.status === 'PAID' ? curr.amount : 0), 0).toLocaleString()}</h3>
                            <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs">
                                <ArrowUpRight className="w-4 h-4" />
                                +12.5% from last month
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Wallet Balance</p>
                            <h3 className="text-3xl font-black text-teal-600 tracking-tight">₹{profile?.wallet?.balance?.toLocaleString() || '0'}</h3>
                            <button className="mt-4 text-gray-900 font-black text-[10px] uppercase tracking-widest hover:underline">Top Up Wallet</button>
                        </div>
                        <div className="bg-teal-600 p-8 rounded-[2.5rem] shadow-xl shadow-teal-900/10 text-white relative overflow-hidden">
                            <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest mb-4 relative z-10">Active Plan</p>
                            <h3 className="text-2xl font-black tracking-tight relative z-10">Standard Patient</h3>
                            <p className="text-teal-100 text-xs mt-1 relative z-10 font-medium">Free Tier</p>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-4 rounded-2xl transition-all ${showFilters || methodFilter || dateRange.from ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-400 hover:text-teal-600'}`}
                                >
                                    <Filter className="w-5 h-5" />
                                </button>
                                <div className="flex bg-gray-50 p-1.5 rounded-2xl">
                                    <button 
                                        onClick={() => { setFilter("all"); setPage(1); }}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        All
                                    </button>
                                    <button 
                                        onClick={() => { setFilter("paid"); setPage(1); }}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'paid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Paid
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-50 flex flex-wrap gap-6 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Payment Method</label>
                                    <select 
                                        value={methodFilter}
                                        onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
                                        className="bg-white border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-teal-500/20 outline-none min-w-[160px]"
                                    >
                                        <option value="">All Methods</option>
                                        <option value="WALLET">Wallet</option>
                                        <option value="STRIPE">Stripe</option>
                                        <option value="RAZORPAY">Razorpay</option>
                                        <option value="PAYPAL">PayPal</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Date From</label>
                                    <input 
                                        type="date"
                                        value={dateRange.from}
                                        onChange={(e) => { setDateRange(prev => ({ ...prev, from: e.target.value })); setPage(1); }}
                                        className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Date To</label>
                                    <input 
                                        type="date"
                                        value={dateRange.to}
                                        onChange={(e) => { setDateRange(prev => ({ ...prev, to: e.target.value })); setPage(1); }}
                                        className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                                    />
                                </div>

                                {(methodFilter || dateRange.from || dateRange.to) && (
                                    <button 
                                        onClick={() => { setMethodFilter(""); setDateRange({ from: "", to: "" }); setPage(1); }}
                                        className="self-end mb-1 px-4 py-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Method</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {activities.map((activity, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={activity.id} 
                                            className="hover:bg-gray-50/50 transition-all group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 ${activity.type === 'WALLET_TOPUP' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {activity.type === 'WALLET_TOPUP' ? <ArrowDownLeft className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 tracking-tight">
                                                            {activity.description}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">#{activity.id.slice(-8).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {activity.method === 'WALLET' ? <Wallet className="w-4 h-4 text-gray-400" /> : <CreditCard className="w-4 h-4 text-gray-400" />}
                                                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{activity.method}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-gray-600">{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'N/A'}</p>
                                                <p className="text-[10px] font-medium text-gray-400 mt-1">{activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black text-gray-900">₹{activity.amount?.toLocaleString() ?? '0'}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(activity.status)}`}>
                                                    {activity.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {(activity.status === 'FAILED' || activity.appointmentStatus === 'PAYMENT_FAILED_HOLD') && activity.appointmentStatus !== 'EXPIRED' && activity.appointmentId && (
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/retry`, {
                                                                        method: 'POST',
                                                                        headers: { 
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${localStorage.getItem('token')}` 
                                                                        },
                                                                        body: JSON.stringify({ appointmentId: activity.appointmentId })
                                                                    });
                                                                    const data = await response.json();
                                                                    if (data.stripeUrl) {
                                                                        window.location.href = data.stripeUrl;
                                                                    } else {
                                                                        alert("Failed to initiate retry. Please try again.");
                                                                    }
                                                                } catch (err) {
                                                                    console.error("Retry failed", err);
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-[#3B82F6] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-100"
                                                        >
                                                            Retry
                                                        </button>
                                                    )}
                                                    <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {activities.length === 0 && !loading && (
                            <div className="p-20 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <Receipt className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2">No transactions found</h3>
                                <p className="text-sm text-gray-400 font-medium">When you book an appointment or top up your wallet, it will appear here.</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="p-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Page <span className="text-gray-900">{page}</span> of <span className="text-gray-900">{totalPages}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
