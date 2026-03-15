import { useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"

import { signup } from "@/infrastructure/api/auth.api"
import type { RegisterPayload } from "../types/auth.types"

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").regex(/^[A-Za-z]+$/, "First name must contain only letters"),
  lastName: z.string().min(1, "Last name is required").regex(/^[A-Za-z]+$/, "Last name must contain only letters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/, "Password must contain letters, numbers and symbols"),
  acceptedTerms: z.literal(true).refine((val) => val === true, {
    message: "You must accept the terms"
  }),
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
    setErrorMessage(null)

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
      await signup(form)

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
        
        // Check if it's a stringified ZodError
        try {
          const parsed = JSON.parse(msg)
          if (Array.isArray(parsed) && parsed[0]?.message) {
            msg = parsed.map((e: any) => e.message).join(", ")
          }
        } catch (e) {
          // not json, leave as is
        }
      }
      setErrorMessage(msg)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-[420px]"
      >

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-md font-semibold">
            M
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center">
          Create your account
        </h2>

        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Join thousands of patients managing health better
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* Name Fields */}
        <div className="flex gap-3 mb-4">

          <div className="flex-1">
            <label className="text-sm text-gray-600">
              First Name
            </label>

            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 mt-1 ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="John"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div className="flex-1">
            <label className="text-sm text-gray-600">
              Last Name
            </label>

            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 mt-1 ${errors.lastName ? 'border-red-500' : ''}`}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

        </div>

        {/* Email */}
        <div className="mb-4">

          <label className="text-sm text-gray-600">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 mt-1 ${errors.email ? 'border-red-500' : ''}`}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

        </div>

        {/* Phone */}
        <div className="mb-4">

          <label className="text-sm text-gray-600">
            Phone Number
          </label>

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 mt-1 ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="1234567890"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}

        </div>

        {/* Password */}
        <div className="mb-4">

          <label className="text-sm text-gray-600">
            Create Password
          </label>

          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                // Eye Off Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                // Eye Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

        </div>

        {/* Terms */}
        <div className="mb-6">
          <div className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={form.acceptedTerms}
              onChange={handleChange}
              className="mt-1"
            />

            <p className="text-gray-600">
              I agree to the{" "}
              <span className="text-blue-600 cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-blue-600 cursor-pointer">
                Privacy Policy
              </span>, including the processing of my health data.
            </p>
          </div>
          {errors.acceptedTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptedTerms}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create Account
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/patient/login"
            className="text-blue-600 font-medium"
          >
            Sign in
          </Link>
        </p>

      </form>

    </div>
  )
}