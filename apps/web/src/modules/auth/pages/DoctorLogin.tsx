import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch } from "@/core/store/hooks"
import { setAuth } from "../../store/authSlice"
import { doctorLogin } from "@/infrastructure/api/auth.api"
import { toast } from "sonner"
import { User, Lock, ArrowRight, Stethoscope, Eye, EyeOff, AlertCircle } from "lucide-react"

const doctorLoginSchema = z.object({
  email: z.string().min(1, "Employee ID or email is required"),
  password: z.string().min(1, "Password is required")
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
                    role: "DOCTOR",
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
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-outfit relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl opacity-50 -mr-48 -mt-48 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-50 -ml-48 -mb-48 -z-10"></div>

            <div className="w-full max-w-md space-y-8 relative">
                <div className="text-center">
                    <div className="mx-auto w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200 mb-6">
                        <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Doctor Portal</h1>
                    <p className="text-gray-500 font-medium mt-2">Access your clinical workspace</p>
                </div>

                {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[13px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Employee ID / Email</label>
                            <div className="relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-teal-600'}`}>
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    {...register("email")}
                                    type="text"
                                    placeholder="doctor@medixflow.com"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl text-sm transition-all font-medium placeholder:text-gray-300 outline-none ${
                                        errors.email 
                                            ? 'border-red-100 focus:border-red-200 focus:ring-4 focus:ring-red-50/50 text-red-600' 
                                            : 'border-transparent focus:bg-white focus:ring-4 focus:ring-teal-50/50'
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 ml-1 text-[11px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 lowercase tracking-wider">
                                    * {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Secure Password</label>
                                <Link to="/doctor/forgot-password" title="Reset your password" className="text-[11px] font-bold text-teal-600 hover:underline uppercase tracking-widest">Reset access</Link>
                            </div>
                            <div className="relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-teal-600'}`}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-2xl text-sm transition-all font-bold tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300 outline-none ${
                                        errors.password 
                                            ? 'border-red-100 focus:border-red-200 focus:ring-4 focus:ring-red-50/50 text-red-600' 
                                            : 'border-transparent focus:bg-white focus:ring-4 focus:ring-teal-50/50'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 ml-1 text-[11px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 lowercase tracking-wider">
                                    * {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-teal-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? "Verifying..." : "Sign in to Workspace"}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-gray-400 text-sm font-bold lowercase tracking-wider">
                        New medical partner? <Link to="/contact" className="text-teal-600 hover:underline">Apply for access</Link>
                    </p>
                </div>
            </div>

            {/* Security footer */}
            <div className="absolute bottom-10 left-0 right-0 text-center">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MedixFlow Security Monitor</span>
                </div>
            </div>
        </div>
    )
}
