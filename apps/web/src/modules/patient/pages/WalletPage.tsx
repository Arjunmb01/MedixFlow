import Sidebar from "../components/dashboard/Sidebar";
import TopNav from "../components/dashboard/TopNav";
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile";
import { useState, useEffect } from "react";
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    History, 
    Plus, 
    Loader2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    CreditCard
} from "lucide-react";
import { getWalletBalance, topUpWallet, getFinancialActivity } from "@/infrastructure/api/appointment.api";
import { toast } from "sonner";

interface Transaction {
    id: string;
    amount: number;
    type: "TOP_UP" | "PAYMENT" | "REFUND";
    status: "SUCCESS" | "PENDING" | "FAILED" | "PAID";
    method: "WALLET" | "RAZORPAY";
    createdAt: string;
    description: string;
    referenceId?: string;
}

export default function WalletPage() {
    const { profile } = usePatientProfile();
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isToppingUp, setIsToppingUp] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState<string>("");
    const limit = 10;

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const [balanceData, activityData] = await Promise.all([
                getWalletBalance(),
                getFinancialActivity({ page, limit })
            ]);
            setBalance(balanceData.wallet.balance);
            setTransactions(activityData.data || []);
            setTotalTransactions(activityData.total || 0);
        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
            setBalance(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [page]);

    // Removed Razorpay Script Loading as we use Stripe now

    const handleTopUp = async () => {
        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsToppingUp(true);
        try {
            const response = await topUpWallet(amount);
            if (response.url) {
                toast.info("Redirecting to secure payment...");
                window.location.href = response.url;
            } else {
                toast.success("Wallet top-up initiated");
                fetchWalletData();
                setTopUpAmount("");
            }
        } catch (error) {
            toast.error("Failed to initiate top-up");
        } finally {
            setIsToppingUp(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC] flex-col font-outfit">
                <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[#64748B] font-bold">Loading Wallet...</p>
            </div>
        );
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
                    {/* Header */}
                    <header className="mb-10">
                        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-4">
                            <span className="hover:text-[#3B82F6] cursor-pointer">Dashboard</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-[#0F172A]">My Wallet</span>
                        </nav>
                        <h1 className="text-[34px] font-black text-[#0F172A] tracking-tighter">Financial Overview</h1>
                        <p className="text-[#64748B] font-medium mt-1">Manage your balance and track your healthcare expenses.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Balance Card */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
                                
                                <div className="relative flex justify-between items-start mb-12">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Total Balance</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[54px] font-black tracking-tighter">₹{balance?.toLocaleString() ?? '0'}</span>
                                            <span className="text-slate-400 font-bold mb-4">.00</span>
                                        </div>
                                    </div>
                                    <div className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                        <Wallet className="w-7 h-7 text-blue-400" />
                                    </div>
                                </div>

                                <div className="relative grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                                            <p className="text-sm font-black text-emerald-400">Account Active</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</p>
                                            <p className="text-sm font-black text-white">Savings Wallet</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction History */}
                            <div className="bg-white rounded-[2.5rem] border border-[#E2E8F0] overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-[#F1F5F9] flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <History className="w-5 h-5 text-[#3B82F6]" />
                                        <h2 className="text-lg font-black text-[#0F172A] tracking-tight">Recent Transactions</h2>
                                    </div>
                                    <button className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest hover:underline transition-all">View All</button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[#F8FAFC]">
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#F1F5F9]">Transaction</th>
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#F1F5F9]">Date</th>
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#F1F5F9]">Status</th>
                                                <th className="px-8 py-4 text-right text-[10px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#F1F5F9]">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#F1F5F9]">
                                            {transactions.length > 0 ? transactions.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                                tx.type === 'TOP_UP' ? 'bg-[#ECFDF5] text-[#10B981]' : 
                                                                tx.type === 'PAYMENT' ? 'bg-[#EFF6FF] text-[#3B82F6]' : 
                                                                'bg-[#FEF2F2] text-[#EF4444]'
                                                            }`}>
                                                                {tx.type === 'TOP_UP' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-[#0F172A] tracking-tight">
                                                                    {tx.description}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <p className="text-[10px] text-[#94A3B8] font-bold">Ref: {tx.referenceId?.slice(-8).toUpperCase()}</p>
                                                                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                                    <p className="text-[10px] text-[#3B82F6] font-black uppercase tracking-widest">{tx.method}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2 text-[#64748B] text-sm font-bold">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            tx.status === 'SUCCESS' || tx.status === 'PAID' ? 'bg-[#ECFDF5] text-[#10B981] border border-[#D1FAE5]' : 
                                                            tx.status === 'PENDING' ? 'bg-[#FFFBEB] text-[#F59E0B] border border-[#FEF3C7]' : 
                                                            'bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]'
                                                        }`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className={`text-sm font-black tracking-tight ${
                                                            tx.type === 'TOP_UP' || tx.type === 'REFUND' ? 'text-[#10B981]' : 'text-[#0F172A]'
                                                        }`}>
                                                            {tx.type === 'TOP_UP' || tx.type === 'REFUND' ? '+' : '-'} ₹{tx.amount?.toLocaleString() ?? '0'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center">
                                                        <div className="max-w-xs mx-auto">
                                                            <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E2E8F0]">
                                                                <History className="w-6 h-6 text-[#CBD5E1]" />
                                                            </div>
                                                            <p className="text-[#64748B] font-bold text-sm">No transaction history found yet.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {totalTransactions > limit && (
                                    <div className="px-8 py-5 bg-[#F8FAFC] border-t border-[#F1F5F9] flex items-center justify-between">
                                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                            Page <span className="text-[#0F172A]">{page}</span> of <span className="text-[#0F172A]">{Math.ceil(totalTransactions / limit)}</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="p-2 bg-white border border-[#E2E8F0] rounded-xl text-[#94A3B8] hover:text-[#3B82F6] disabled:opacity-30 transition-all shadow-sm"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setPage(p => Math.min(Math.ceil(totalTransactions / limit), p + 1))}
                                                disabled={page === Math.ceil(totalTransactions / limit)}
                                                className="p-2 bg-white border border-[#E2E8F0] rounded-xl text-[#94A3B8] hover:text-[#3B82F6] disabled:opacity-30 transition-all shadow-sm"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Up Section */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-[2.5rem] border border-[#E2E8F0] p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-[#3B82F6]" />
                                    </div>
                                    <h2 className="text-lg font-black text-[#0F172A] tracking-tight">Add Funds</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-2 block px-2">Enter Amount (INR)</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-[#CBD5E1]">₹</span>
                                            <input 
                                                type="number" 
                                                value={topUpAmount}
                                                onChange={(e) => setTopUpAmount(e.target.value)}
                                                placeholder="500"
                                                className="w-full pl-12 pr-6 py-5 rounded-2xl bg-[#F8FAFC] border-2 border-[#F1F5F9] focus:border-[#3B82F6] focus:bg-white text-xl font-black transition-all outline-none placeholder:text-[#CBD5E1]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {["500", "1000", "2000", "5000"].map(amt => (
                                            <button 
                                                key={amt}
                                                onClick={() => setTopUpAmount(amt)}
                                                className="py-3 rounded-xl border-2 border-[#F1F5F9] text-[11px] font-black text-[#64748B] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all"
                                            >
                                                + ₹{amt}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleTopUp}
                                        disabled={!topUpAmount || isToppingUp}
                                        className={`w-full py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex justify-center items-center ${
                                            topUpAmount && !isToppingUp
                                            ? "bg-[#3B82F6] text-white shadow-blue-100 hover:bg-[#2563EB]"
                                            : "bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed"
                                        }`}
                                    >
                                        {isToppingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Top Up"}
                                    </button>

                                    <div className="pt-4 border-t border-[#F1F5F9]">
                                        <div className="flex items-center gap-3 p-4 bg-[#EFF6FF] rounded-2xl border border-[#DBEAFE]">
                                            <div className="shrink-0">
                                                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-[11px] text-[#1E40AF] font-bold leading-relaxed">
                                                Payments are processed securely via Stripe. Funds will be credited to your wallet instantly after successful payment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Help Button */}
            <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#3B82F6] text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-200 hover:scale-110 active:scale-95 transition-all text-2xl">
                ✨
            </button>
        </div>
    );
}
