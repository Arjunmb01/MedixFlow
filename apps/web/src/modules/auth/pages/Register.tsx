import { useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { toast } from "sonner"

import { patientRegister } from "@/infrastructure/api/auth.api"
import type { RegisterPayload } from "../types/auth.types"

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(15, "First name cannot exceed 15 characters").regex(/^[A-Za-z]+$/, "First name must contain only letters"),
  lastName: z.string().min(1, "Last name is required").max(15, "Last name cannot exceed 15 characters").regex(/^[A-Za-z]+$/, "Last name must contain only letters"),
  email: z.string().email("Invalid email address").max(30, "Email cannot exceed 30 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits").max(15, "Phone cannot exceed 15 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(35, "Password cannot exceed 35 characters").regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/, "Password must contain letters, numbers and symbols"),
  acceptedTerms: z.literal(true).refine((val) => val === true, {
    message: "You must accept the terms"
  }),
}).refine(data => (data.firstName.length + data.lastName.length) <= 20, {
  message: "Total length of first and last name cannot exceed 20 characters",
  path: ["firstName"]
})

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState<RegisterPayload>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    acceptedTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})

    const result = signupSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    try {
      await patientRegister(form)
      toast.success("Account created successfully!")
      navigate("/auth/verify-otp", {
        state: {
          email: form.email,
          expiresIn: 120
        }
      })
    } catch (error: any) {
      console.error("Signup failed:", error)
      let msg = "An unexpected error occurred during signup."
      if (error.response?.data?.message) {
        msg = error.response.data.message
        try {
          const parsed = JSON.parse(msg)
          if (Array.isArray(parsed) && parsed[0]?.message) {
            msg = parsed.map((e: any) => e.message).join(", ")
          }
        } catch (e) {
     
        }
      }
      toast.error(msg)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50 font-outfit px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-white px-8 py-10 md:px-10 rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-gray-100 w-full max-w-[480px]"
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link to="/">
            <img src="/logo.png" alt="MedixFlow Logo" className="h-20 w-auto object-contain" />
          </Link>
        </div>

        {/* Title */}
        <h2 className="text-[28px] font-black text-center text-gray-900 tracking-tight leading-tight">
          Create Account
        </h2>

        <p className="text-[14px] text-gray-400 text-center mt-2 mb-10 font-bold uppercase tracking-widest">
          Join the ecosystem
        </p>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              First Name
            </label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="John"
              maxLength={30}
              className={`w-full bg-gray-50/50 border-2 rounded-2xl px-4 py-4 text-sm transition-all outline-none font-bold placeholder:text-gray-300 placeholder:font-medium ${
                errors.firstName 
                    ? 'border-red-100 focus:border-red-400 focus:ring-8 focus:ring-red-50/30 text-red-600' 
                    : 'border-gray-50 focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30'
              }`}
            />
            {errors.firstName && <p className="mt-2 ml-1 text-[11px] font-bold text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Last Name
            </label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Doe"
              maxLength={30}
              className={`w-full bg-gray-50/50 border-2 rounded-2xl px-4 py-4 text-sm transition-all outline-none font-bold placeholder:text-gray-300 placeholder:font-medium ${
                errors.lastName 
                    ? 'border-red-100 focus:border-red-400 focus:ring-8 focus:ring-red-50/30 text-red-600' 
                    : 'border-gray-50 focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30'
              }`}
            />
            {errors.lastName && <p className="mt-2 ml-1 text-[11px] font-bold text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2 mb-6">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            maxLength={30}
            className={`w-full bg-gray-50/50 border-2 rounded-2xl px-5 py-4 text-sm transition-all outline-none font-bold placeholder:text-gray-300 placeholder:font-medium ${
              errors.email 
                  ? 'border-red-100 focus:border-red-400 focus:ring-8 focus:ring-red-50/30 text-red-600' 
                  : 'border-gray-50 focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30'
            }`}
          />
          {errors.email && <p className="mt-2 ml-1 text-[11px] font-bold text-red-500">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2 mb-6">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Phone Number
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="1234567890"
            maxLength={15}
            className={`w-full bg-gray-50/50 border-2 rounded-2xl px-5 py-4 text-sm transition-all outline-none font-bold placeholder:text-gray-300 placeholder:font-medium ${
              errors.phone 
                  ? 'border-red-100 focus:border-red-400 focus:ring-8 focus:ring-red-50/30 text-red-600' 
                  : 'border-gray-50 focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30'
            }`}
          />
          {errors.phone && <p className="mt-2 ml-1 text-[11px] font-bold text-red-500">{errors.phone}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2 mb-8">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Secure Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              maxLength={35}
              className={`w-full bg-gray-50/50 border-2 rounded-2xl pl-5 pr-14 py-4 text-sm transition-all outline-none font-black tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300 ${
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
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="mt-2 ml-1 text-[11px] font-bold text-red-500">{errors.password}</p>}
        </div>

        {/* Terms */}
        <div className="mb-10 p-5 bg-gray-50/50 rounded-[24px] border border-gray-100">
          <div className="flex items-start gap-3 text-[13px]">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={form.acceptedTerms}
              onChange={handleChange}
              className="mt-1 w-5 h-5 rounded-lg border-2 border-gray-200 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
            />
            <p className="text-gray-500 font-bold leading-relaxed">
              Accept the{" "}
              <span className="text-primary-600 cursor-pointer hover:underline">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-primary-600 cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </p>
          </div>
          {errors.acceptedTerms && <p className="mt-2 ml-8 text-[11px] font-bold text-red-500">{errors.acceptedTerms}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4.5 text-[16px] rounded-2xl transition-all shadow-xl shadow-primary-100 hover:shadow-primary-200 active:scale-[0.98] group"
        >
          <span className="flex items-center justify-center gap-2">
            Create Account
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </button>

        {/* Login Link */}
        <p className="text-center text-[14px] text-gray-400 mt-10 font-bold">
          Already have an account?{" "}
          <Link
            to="/patient/login"
            className="text-primary-600 font-black ml-1 hover:text-primary-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}