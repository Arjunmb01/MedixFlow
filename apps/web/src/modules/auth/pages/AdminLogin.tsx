import { useState, type ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"

import { useAppDispatch } from "@/core/store/hooks"
import { setAuth } from "../../store/authSlice"

import { adminLogin } from "@/infrastructure/api/auth.api"
import { toast } from "sonner"

import type { LoginPayload } from "../types/auth.types"

import { Eye, EyeOff } from "lucide-react"

export default function AdminLogin() {

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [form, setForm] = useState<LoginPayload>({
        email: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))

    }

    const handleSubmit = async (
        e: ChangeEvent<HTMLFormElement>
    ) => {

        e.preventDefault()
        setErrorMessage(null)

        try {

            const response = await adminLogin(form)
            const { accessToken } = response.data
            dispatch(
                setAuth({
                    role: "ADMIN",
                    accessToken
                })
            )
            toast.success("Welcome back, Admin!")
            navigate("/admin/dashboard")

        } catch (error: any) {

            console.error("Admin login failed:", error)
            if (error.response?.data?.message) {
                setErrorMessage(error.response.data.message)
            } else {
                setErrorMessage("Admin login failed. Please check your credentials.")
            }

        }

    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#222222]">
            <form
                onSubmit={handleSubmit}
                className="bg-[#1e1e1e] p-10 rounded-xl border border-[#333333] w-[400px] shadow-2xl"
            >
                {/* Logo */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white mb-6">
                   <span className="text-black font-bold text-xl">M</span>
                </div>

                <h2 className="text-[22px] font-semibold text-center text-white">
                    System Admin
                </h2>

                <p className="text-[13px] text-gray-400 text-center mt-2 mb-8">
                    Secure administrative access only
                </p>

                {errorMessage && (
                    <div className="mb-6 p-3 bg-red-900/30 text-red-400 text-sm rounded-md border border-red-800/50 text-center">
                        {errorMessage}
                    </div>
                )}

                <div className="mb-5">
                    <label className="block text-[12px] text-gray-300 mb-1.5 font-medium">
                        Admin Email
                    </label>
                    <input
                        name="email"
                        type="email"
                        placeholder="admin@medixflow.com"
                        className="w-full bg-[#666666] text-white border-none rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#10b981] outline-none placeholder:text-gray-300/80 transition-all font-medium"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-[12px] text-gray-300 mb-1.5 font-medium">
                        Secure Password
                    </label>
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full bg-[#666666] text-white border-none rounded-md pl-3 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-[#10b981] outline-none placeholder:text-gray-300/80 transition-all font-bold ${!showPassword ? 'tracking-widest' : ''}`}
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#10b981] hover:bg-[#0ea5e9] text-white font-medium py-2.5 text-[14px] rounded-md transition-colors"
                >
                    Sign in to Workspace
                </button>
            </form>
        </div>
    )
}