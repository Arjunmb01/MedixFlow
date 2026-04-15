import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch } from "@/core/store/hooks"
import { UserRole } from "../types/auth.types"
import { setAuth } from "../../store/authSlice"
import { doctorLogin } from "@/infrastructure/api/auth.api"
import { toast } from "sonner"
import { User, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react"

const doctorLoginSchema = z.object({
  email: z.string().min(1, "Employee ID or email is required").max(30, "Employee ID or email cannot exceed 30 characters"),
  password: z.string().min(1, "Password is required").max(35, "Password cannot exceed 35 characters")
})

type DoctorLoginFormValues = z.infer<typeof doctorLoginSchema>

export default function DoctorLogin() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<DoctorLoginFormValues>({
        resolver: zodResolver(doctorLoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onFormSubmit = async (data: DoctorLoginFormValues) => {
        setLoading(true)
        setErrorMessage(null)

        try {
            const response = await doctorLogin(data)
            const { accessToken } = response
            dispatch(
                setAuth({
                    role: UserRole.DOCTOR,
                    accessToken
                })
            )
            toast.success("Welcome back, Doctor!")
            navigate("/doctor/dashboard")
        } catch (error: any) {
            console.error("Doctor login failed:", error)
            const msg = error.response?.data?.message || "Login failed. Please check your credentials."
            setErrorMessage(msg)
            if (error.response?.data?.code === "ACCOUNT_BLOCKED") {
                toast.error(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6 text-outfit relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px] -mr-48 -mt-48 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[120px] -ml-48 -mb-48 -z-10"></div>

            <div className="w-full max-w-sm space-y-10 relative">
                <div className="text-center">
                    <div className="flex justify-center mb-8">
                        <Link to="/">
                            <img src="/logo.png" alt="MedixFlow Logo" className="h-20 w-auto object-contain" />
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Doctor Portal</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[11px] mt-3">Access clinical workspace</p>
                </div>

                {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[13px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Employee ID / Email</label>
                            <div className="relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-300 group-focus-within:text-primary-600'}`}>
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    {...register("email")}
                                    type="text"
                                    placeholder="doctor@medixflow.com"
<<<<<<< HEAD
=======
                                    maxLength={30}
>>>>>>> 871c7862bcf397135f6809ff88e6ccf8cd29ad3c
                                    className={`w-full pl-12 pr-4 py-4.5 bg-white border-2 rounded-2xl text-sm transition-all font-bold placeholder:text-gray-300 placeholder:font-medium outline-none ${
                                        errors.email 
                                            ? 'border-red-100 focus:border-red-400 focus:ring-8 focus:ring-red-50/30 text-red-600' 
                                            : 'border-gray-50 focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30'
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 ml-1 text-[11px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 tracking-wider">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Secure Password</label>
                                <Link to="/doctor/forgot-password" title="Reset your password" className="text-[11px] font-black text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-[0.1em]">Reset access</Link>
                            </div>
                            <div className="relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-300 group-focus-within:text-primary-600'}`}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
<<<<<<< HEAD
=======
                                    maxLength={35}
>>>>>>> 871c7862bcf397135f6809ff88e6ccf8cd29ad3c
                                    className={`w-full pl-12 pr-12 py-4.5 bg-white border-2 rounded-2xl text-sm transition-all font-black tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300 outline-none ${
                                        errors.password 
                                            ? 'border-red-100 focus:border-red-400 focus:ring-8 focus:ring-red-50/30 text-red-600' 
                                            : 'border-gray-50 focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 ml-1 text-[11px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 tracking-wider">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4.5 rounded-[20px] transition-all shadow-xl shadow-primary-200 hover:shadow-primary-300 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                    >
                        {loading ? "Verifying..." : "Sign in to Workspace"}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-gray-400 text-[13px] font-bold">
                        New medical partner? <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-black ml-1 transition-colors">Apply for access</Link>
                    </p>
                </div>
            </div>

            {/* Security footer */}
            <div className="absolute bottom-10 left-0 right-0 text-center">
                 <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 rounded-full shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-0.5">MedixFlow Security Monitor</span>
                </div>
            </div>
        </div>
    )
}
