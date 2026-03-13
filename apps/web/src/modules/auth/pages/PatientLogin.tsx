import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"

import { useAppDispatch } from "@/core/store/hooks"
import { setAuth } from "../../store/authSlice"

import { patientLogin } from "@/infrastructure/api/auth.api"

import type { LoginPayload } from "../types/auth.types"


export default function PatientLogin() {

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [form, setForm] = useState<LoginPayload>({
        email: "",
        password: ""
    })
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
        e: FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault()
        setErrorMessage(null)

        try {

            const res = await patientLogin(form)

            dispatch(
                setAuth({
                    token: res.data.accessToken,
                    role: "PATIENT"
                })
            )

            navigate("/patient/dashboard")

        } catch (error: any) {

            console.error("Login failed:", error)
            if (error.response?.data?.message) {
               setErrorMessage(error.response.data.message)
            } else {
               setErrorMessage("Login failed. Please check your credentials.")
            }

        }

    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <form
                onSubmit={handleSubmit}
                className="bg-white px-10 py-10 rounded-xl shadow-sm w-[440px]"
            >
                {/* Logo */}
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[#0066cc] mb-6">
                   <span className="text-white font-bold text-lg">M</span>
                </div>

                <h2 className="text-[22px] font-bold text-center text-gray-900">
                    Welcome back
                </h2>

                <p className="text-[14px] text-gray-500 text-center mt-2 mb-8">
                    Sign in to your patient portal
                </p>

                {errorMessage && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Social Login Buttons (Mockup only/Non-functional as per req) */}
                <div className="flex gap-4 mb-6">
                    <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-md py-[10px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                    </button>
                    <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-md py-[10px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="h-[20px] w-[20px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.53.68 3.14.68.65 0 2.09-.8 3.68-.69 1.48.06 2.86.64 3.75 1.77-3.15 1.83-2.64 6.25.43 7.42-1.01 2.37-2.15 3.03-3 3.79M12.03 6.09c-.21-3.28 3.07-5.32 4.96-5.33.4 3.52-3.32 5.67-4.96 5.33" fill="#000000"/>
                        </svg>
                        Apple ID
                    </button>
                </div>

                {/* OR EMAIL Divider */}
                <div className="relative flex items-center justify-center mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative bg-white px-3 text-[11px] font-medium text-gray-400 tracking-wider">
                        OR EMAIL
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-[13px] text-gray-600 font-medium mb-1">
                        Email Address
                    </label>
                    <input
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className="w-full border border-gray-200 rounded-md px-3 py-[10px] text-sm focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none transition-all placeholder:text-gray-400"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-[13px] text-gray-600 font-medium">
                            Password
                        </label>
                        <Link to="/forgot-password" className="text-[13px] text-[#0066cc] font-medium hover:underline">
                            Forgot?
                        </Link>
                    </div>
                    <input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-md px-3 py-[10px] text-sm focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none transition-all placeholder:text-gray-600"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#0066cc] text-white font-medium py-[10px] text-[15px] rounded-md hover:bg-blue-700 transition-colors"
                >
                    Sign in
                </button>

                <div className="text-center text-[13px] text-gray-500 mt-8">
                    Don't have an account?{" "}
                    <Link to="/auth/register" className="text-[#0066cc] hover:underline font-medium ml-1">
                        Create one
                    </Link>
                </div>

            </form>
        </div>
    )
}