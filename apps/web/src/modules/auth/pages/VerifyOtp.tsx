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
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50 font-outfit px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white px-8 py-10 md:px-12 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 w-full max-w-[460px]"
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link to="/">
            <img src="/logo.png" alt="MedixFlow Logo" className="h-16 w-auto object-contain" />
          </Link>
        </div>

        <h2 className="text-[26px] font-black text-center text-gray-900 tracking-tight leading-tight">
          Check your email
        </h2>

        <div className="text-[14px] text-gray-400 text-center mt-3 mb-10 font-bold leading-relaxed uppercase tracking-widest">
          Code sent to
          <span className="block font-black text-gray-900 mt-1 normal-case tracking-normal text-[15px]">{email}</span>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100/50 text-center font-bold animate-in fade-in slide-in-from-top-2">
            {errorMessage}
          </div>
        )}

        {/* 6 OTP Inputs */}
        <div className="flex justify-between gap-3 mb-10 px-1">
          {otpValues.map((value, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="
                w-12 h-14 md:w-14 md:h-16
                text-center text-xl font-black
                text-gray-900
                bg-gray-50/50
                border-2 border-gray-50
                rounded-2xl
                focus:bg-white
                focus:border-primary-600/30
                focus:ring-8 focus:ring-primary-50/30
                outline-none
                transition-all
              "
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4.5 text-[16px] rounded-2xl transition-all shadow-xl shadow-primary-100 hover:shadow-primary-200 active:scale-[0.98] group"
        >
          <span className="flex items-center justify-center gap-2">
            Verify workspace
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </button>

        <div className="flex items-center justify-center gap-3 mt-8 text-sm text-gray-400 font-bold uppercase tracking-widest">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-primary-600 font-black hover:text-primary-700 transition-colors"
            >
              Resend Code
            </button>
          ) : (
            <>
              <span>Resend in</span>
              <span className="font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-[12px]">{formatTime(timer)}</span>
            </>
          )}
        </div>

        <div className="text-center text-[14px] text-gray-400 mt-10 font-bold">
          Not your email?{" "}
          <Link to="/auth/register" className="text-primary-600 hover:text-primary-700 font-black ml-1 transition-colors">
            Change address
          </Link>
        </div>

      </form>
    </div>
  )
}