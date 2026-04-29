import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { CheckCircle2, Calendar, Clock, User, ArrowRight, Receipt } from "lucide-react"
import { motion } from "framer-motion"
import api from "@/core/api/axios"

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams()
    const appointmentId = searchParams.get("appointment_id")
    const sessionId = searchParams.get("session_id")
    const paypalToken = searchParams.get("token")
    const [appointment, setAppointment] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (sessionId || paypalToken) {
            verifyAndFetchDetails()
        } else if (appointmentId) {
            fetchAppointmentDetails()
        }
    }, [appointmentId, sessionId, paypalToken])

    const verifyAndFetchDetails = async () => {
        try {
            setLoading(true)
            // 1. Verify with backend (this ensures status is updated if webhook was slow)
            if (sessionId) {
                await api.get(`/payments/verify/stripe/${sessionId}`)
            } else if (paypalToken) {
                await api.get(`/payments/verify/paypal/${paypalToken}`)
            }
            
            // 2. Fetch appointment details
            if (appointmentId) {
                const response = await api.get(`/appointments/${appointmentId}`)
                setAppointment(response.data.data)
            }
        } catch (error: any) {
            console.error("Verification failed:", error)
            setError(error.response?.data?.message || "Failed to verify payment")
        } finally {
            setLoading(false)
        }
    }

    const fetchAppointmentDetails = async () => {
        try {
            const response = await api.get(`/appointments/${appointmentId}`)
            setAppointment(response.data.data)
        } catch (error) {
            console.error("Failed to fetch appointment details:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Error</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link to="/patient/billing" className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold">
                        Go to Billing History
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-teal-900/5 overflow-hidden border border-gray-100"
            >
                <div className="bg-teal-600 p-8 text-center text-white relative overflow-hidden">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                        className="relative z-10 inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-4"
                    >
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black relative z-10">Booking Confirmed!</h1>
                    <p className="text-teal-100 mt-2 relative z-10 font-medium">Your payment was successful</p>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                                    <User className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</p>
                                    <p className="text-sm font-bold text-gray-900">Dr. {appointment?.doctor?.firstName} {appointment?.doctor?.lastName}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-600">
                                        {new Date(appointment?.appointmentDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-600">{appointment?.slotStart}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link 
                                to="/appointments"
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
                            >
                                View My Appointments
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            
                            <button className="w-full bg-white text-gray-600 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 border border-gray-100 hover:bg-gray-50 transition-all">
                                <Receipt className="w-4 h-4" />
                                Download Invoice
                            </button>
                        </div>
                    </div>

                    <p className="text-center mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                        Transaction ID: {appointment?.payment?.id?.slice(-12).toUpperCase()}
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
