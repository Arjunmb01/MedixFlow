import { useState, useEffect, useRef, type KeyboardEvent, type ClipboardEvent, type FormEvent } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"

import { verifyOtp, resendOtp } from "@/infrastructure/api/auth.api"

import type { VerifyOtpPayload } from "../types/auth.types"

interface LocationState {
  email: string
  expiresIn?: number
}

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as LocationState | null
  const email = state?.email || ""
  const expiresIn = state?.expiresIn || 120

  useEffect(() => {
    if (!email) {
      navigate("/auth/register")
    }
  }, [email, navigate])

  const [form, setForm] = useState<VerifyOtpPayload>({
    email,
    otp: ""
  })

  const [otpValues, setOtpValues] = useState<string[]>(new Array(6).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [timer, setTimer] = useState(expiresIn)
  const [canResend, setCanResend] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true)
      return
    }

    const interval = setInterval(() => {
      setTimer(prev => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)
    setForm(prev => ({ ...prev, otp: newOtpValues.join("") }))

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otpValues[index] === "" && index > 0) {
        const newOtpValues = [...otpValues]
        newOtpValues[index - 1] = ""
        setOtpValues(newOtpValues)
        setForm(prev => ({ ...prev, otp: newOtpValues.join("") }))
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6).replace(/[^0-9a-zA-Z]/g, '')
    if (pastedData) {
      const newOtpValues = [...otpValues]
      for (let i = 0; i < pastedData.length; i++) {
        newOtpValues[i] = pastedData[i]
      }
      setOtpValues(newOtpValues)
      setForm(prev => ({ ...prev, otp: newOtpValues.join("") }))

      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (form.otp.length !== 6) {
      setErrorMessage("Please enter all 6 digits")
      return
    }

    try {
      await verifyOtp(form)
      navigate("/patient/login")
    } catch (error: any) {
      console.error("OTP verification failed:", error)
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message)
      } else {
        setErrorMessage("Invalid OTP. Please try again.")
      }
    }
  }

  const handleResendOtp = async () => {
    try {
      setErrorMessage(null)
      await resendOtp({ email })
      setTimer(120)
      setCanResend(false)
      setOtpValues(new Array(6).fill(""))
      setForm(prev => ({ ...prev, otp: "" }))
      inputRefs.current[0]?.focus()
    } catch (error: any) {
      console.error("Resend OTP failed:", error)
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message)
      } else {
        setErrorMessage("Failed to resend OTP.")
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white px-10 py-12 rounded-xl shadow-sm w-[440px]"
      >
        {/* Envelope Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5F1FF] mb-6">
          <svg className="h-7 w-7 text-[#0a66c2]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 8.993V6.75m19.5 0-7.5 4.615-7.5-4.615" />
          </svg>
        </div>

        <h2 className="text-[22px] font-bold text-center text-gray-900">
          Check your email
        </h2>

        <div className="text-[14px] text-gray-500 text-center mt-3 mb-8 leading-relaxed">
          We've sent a 6-digit verification code to
          <span className="block font-semibold text-gray-800 mt-[2px]">{email}</span>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 text-center">
            {errorMessage}
          </div>
        )}

        {/* 6 OTP Inputs */}
        <div className="flex justify-between gap-2 mb-8 px-2">
          {otpValues.map((value, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={value}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="
        w-12 h-14
        text-center text-xl font-semibold
        text-gray-900
        bg-gray-300
        border border-gray-300
        rounded-lg
        focus:bg-blue-50
        focus:border-blue-500
        focus:ring-2 focus:ring-blue-200
        outline-none
        transition-all
      "
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-[#0066cc] text-white font-medium py-[10px] text-[15px] rounded-md hover:bg-blue-700 transition-colors"
        >
          Verify Account
        </button>

        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500 text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-gray-700 font-medium hover:text-black transition"
            >
              Resend Code
            </button>
          ) : (
            <>
              <span className="text-[13px]">Resend Code</span>
              <span className="text-[11px] font-semibold text-gray-900">{formatTime(timer)}s</span>
            </>
          )}
        </div>

        <div className="text-center text-[13px] text-gray-500 mt-10">
          Not your email?{" "}
          <Link to="/auth/register" className="text-[#0066cc] hover:underline font-medium ml-1">
            Change address
          </Link>
        </div>

      </form>
    </div>
  )
}