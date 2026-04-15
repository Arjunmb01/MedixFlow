import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch } from "@/core/store/hooks"
import { UserRole } from "../types/auth.types"
import { setAuth } from "../../store/authSlice"
import { adminLogin } from "@/infrastructure/api/auth.api"
import { toast } from "sonner"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

const adminLoginSchema = z.object({
  email: z.string().min(1, "Admin email is required").email("Invalid admin email format"),
  password: z.string().min(1, "Access key is required")
})

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>

export default function AdminLogin() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [showPassword, setShowPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<AdminLoginFormValues>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onFormSubmit = async (data: AdminLoginFormValues) => {
        setErrorMessage(null)
        setLoading(true)

        try {
            const response = await adminLogin(data)
            const { accessToken } = response
            dispatch(
                setAuth({
                    role: UserRole.ADMIN,
                    accessToken
                })
            )
            toast.success("Welcome back, Super Admin!")
            navigate("/admin/dashboard")
        } catch (error: any) {
            console.error("Admin login failed:", error)
            const msg = error.response?.data?.message || "Internal Access Error. Please check security protocols."
            setErrorMessage(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] font-outfit px-4">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-[120px] -mr-48 -mt-48 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[120px] -ml-48 -mb-48 -z-10"></div>
            
            <form
                onSubmit={handleSubmit(onFormSubmit)}
                noValidate
                className="bg-[#111] p-10 rounded-[40px] border border-white/5 w-full max-w-[440px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden"
            >
                {/* Security line at top */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>

                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-8">
                        <Link to="/">
                            <img src="/logo.png" alt="MedixFlow Logo" className="h-20 w-auto object-contain brightness-110" />
                        </Link>
                    </div>
                    <h2 className="text-[28px] font-black text-white tracking-tight uppercase leading-tight">
                        Admin Portal
                    </h2>
                    <p className="text-[11px] font-black text-gray-500 mt-2 uppercase tracking-[0.4em]">
                        Internal Security Layer
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-bold rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                            Auth Identifier
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="SYSTEM_ROOT_ADMIN"
                            className={`w-full bg-[#1a1a1a] text-white border-2 rounded-[18px] px-5 py-4.5 text-sm transition-all outline-none font-bold placeholder:text-gray-700 ${
                                errors.email 
                                    ? 'border-red-500/50 focus:border-red-500' 
                                    : 'border-white/5 focus:border-primary-500/50 focus:bg-[#222]'
                            }`}
                        />
                        {errors.email && (
                            <p className="text-[11px] font-black text-red-500 uppercase tracking-widest ml-1 mt-2">
                                [ACCESS_DENIED]: {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                         <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                            Encryption Key
                        </label>
                        <div className="relative group">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`w-full bg-[#1a1a1a] text-white border-2 rounded-[18px] pl-5 pr-14 py-4.5 text-sm transition-all outline-none font-black tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-700 ${
                                    errors.password 
                                        ? 'border-red-500/50 focus:border-red-500' 
                                        : 'border-white/5 focus:border-primary-500/50 focus:bg-[#222]'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-primary-500 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[11px] font-black text-red-500 uppercase tracking-widest ml-1 mt-2">
                                [KEY_REQUIRED]: {errors.password.message}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-10 bg-primary-500 hover:bg-primary-400 text-[#0a0a0a] font-black py-4.5 text-[14px] uppercase tracking-[0.2em] rounded-[18px] transition-all shadow-[0_20px_40px_rgba(13,148,136,0.15)] active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? "Decrypting access..." : "Initialize Workspace"}
                </button>

                <div className="text-center mt-12 opacity-20 hover:opacity-100 transition-all duration-700">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.6em]">
                        MedixFlow Protocol v2.4.0
                    </p>
                </div>
            </form>
        </div>
    )
}