import { useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { setupDoctorPassword as setupPassword } from "@/infrastructure/api/staff.api"

export default function SetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get("token")
    
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) {
            setError("Missing token")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        setError("")
        try {
            await setupPassword({ token, password })
            setSuccess(true)
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to set password")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 font-outfit">
                <div className="bg-white p-12 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 max-w-md w-full text-center space-y-8">
                    <h2 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Invalid Link</h2>
                    <p className="text-gray-400 font-bold leading-relaxed px-4">The password setup link is missing or has expired in the security protocol.</p>
                    <button 
                        onClick={() => navigate("/admin/login")}
                        className="w-full bg-primary-600 text-white h-16 rounded-[24px] font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 uppercase tracking-widest text-[14px]"
                    >
                        Return to Hub
                    </button>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 font-outfit">
                <div className="bg-white p-12 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] max-w-md w-full text-center border border-gray-100 space-y-8">
                    <div className="flex justify-center mx-auto mb-6">
                        <Link to="/">
                            <img src="/logo.png" alt="MedixFlow Logo" className="h-20 w-auto object-contain" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">Access Granted!</h2>
                        <p className="text-gray-400 font-bold leading-relaxed">Your account is now active. You may proceed to your clinical workspace.</p>
                    </div>
                    <button 
                        onClick={() => navigate("/admin/login")}
                        className="w-full bg-primary-600 text-white h-16 rounded-[24px] font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 uppercase tracking-widest text-[14px]"
                    >
                        Launch Workspace
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 font-outfit">
            <div className="bg-white p-10 md:p-12 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] max-w-md w-full border border-gray-100 space-y-10">
                <div className="flex flex-col items-center space-y-6">
                    <div className="flex justify-center mb-6">
                        <Link to="/">
                            <img src="/logo.png" alt="MedixFlow Logo" className="h-16 w-auto object-contain" />
                        </Link>
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">Set Access Key</h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Initialize your clinical profile</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-5 bg-red-50/50 text-red-600 text-[13px] font-black rounded-[20px] border-2 border-red-50 flex items-center gap-3 uppercase tracking-widest leading-none">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-6 py-5 bg-gray-50/50 border-2 border-gray-50 rounded-[24px] focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/50 outline-none transition-all placeholder:text-gray-300 font-bold text-gray-900 text-[15px]"
<<<<<<< HEAD
=======
                                maxLength={35}
>>>>>>> 871c7862bcf397135f6809ff88e6ccf8cd29ad3c
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Access Key</label>
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-6 py-5 bg-gray-50/50 border-2 border-gray-50 rounded-[24px] focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/50 outline-none transition-all placeholder:text-gray-300 font-bold text-gray-900 text-[15px]"
<<<<<<< HEAD
=======
                                maxLength={35}
>>>>>>> 871c7862bcf397135f6809ff88e6ccf8cd29ad3c
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white h-16 rounded-[24px] font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 uppercase tracking-widest text-[14px] disabled:opacity-50 active:scale-[0.98]"
                    >
                        {loading ? "Optimizing Layer..." : "Finalize Protocol"}
                    </button>
                    
                    <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] pt-4">
                        Secured by <strong className="text-gray-400">MedixFlow</strong> Quantum Layer
                    </p>
                </form>
            </div>
        </div>
    )
}
