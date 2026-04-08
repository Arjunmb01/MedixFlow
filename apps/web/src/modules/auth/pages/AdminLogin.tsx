import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch } from "@/core/store/hooks"
import { setAuth } from "../../store/authSlice"
import { adminLogin } from "@/infrastructure/api/auth.api"
import { toast } from "sonner"
import { Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react"

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
                    role: "ADMIN",
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
        <div className="flex items-center justify-center min-h-screen bg-[#121212] font-outfit">
             {/* Cyberpunk grid background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#10b98115,transparent)]"></div>

            <form
                onSubmit={handleSubmit(onFormSubmit)}
                noValidate
                className="bg-[#1a1a1a] p-10 rounded-2xl border border-white/5 w-[420px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden"
            >
                {/* Security line at top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent"></div>

                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] mb-5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                       <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                        Core Terminal
                    </h2>
                    <p className="text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-[0.3em]">
                        Administrative Security Layer
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                            Auth Identifier
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="SYSTEM_ROOT_ADMIN"
                            className={`w-full bg-[#222222] text-white border-2 rounded-xl px-4 py-3.5 text-sm transition-all outline-none font-medium placeholder:text-gray-700 ${
                                errors.email 
                                    ? 'border-red-500/50 focus:border-red-500' 
                                    : 'border-white/5 focus:border-[#10b981]/50 focus:bg-[#282828]'
                            }`}
                        />
                        {errors.email && (
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1 mt-1.5">
                                [ACCESS_DENIED]: {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                         <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                            Encryption Key
                        </label>
                        <div className="relative group">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`w-full bg-[#222222] text-white border-2 rounded-xl pl-4 pr-12 py-3.5 text-sm transition-all outline-none font-bold tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-700 ${
                                    errors.password 
                                        ? 'border-red-500/50 focus:border-red-500' 
                                        : 'border-white/5 focus:border-[#10b981]/50 focus:bg-[#282828]'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#10b981] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1 mt-1.5">
                                [KEY_REQUIRED]: {errors.password.message}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-10 bg-[#10b981] hover:bg-[#12d192] text-[#0a0a0a] font-black py-4 text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? "Decrypting..." : "Initialize Workspace"}
                </button>

                <div className="text-center mt-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <p className="text-[9px] font-black text-white uppercase tracking-[0.5em]">
                        MedixFlow Protocol v2.4.0
                    </p>
                </div>
            </form>
        </div>
    )
}