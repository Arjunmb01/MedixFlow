import { Link } from "react-router-dom"
import { AlertTriangle, ArrowLeft, HeartPulse } from "lucide-react"
import { motion } from "framer-motion"

export default function PaymentCancel() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-amber-900/5 overflow-hidden border border-gray-100"
            >
                <div className="bg-amber-500 p-10 text-center text-white relative overflow-hidden">
                    <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="relative z-10 inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-4"
                    >
                        <AlertTriangle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black relative z-10 uppercase tracking-tight">Booking Cancelled</h1>
                    <p className="text-amber-100 mt-2 relative z-10 font-medium">The checkout session was closed</p>
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-2xl mb-4">
                            <HeartPulse className="w-7 h-7 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2">Don't worry!</h2>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed px-4">
                            Your health is our priority. You can resume your booking whenever you're ready.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link 
                            to="/patient/doctors"
                            className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/10"
                        >
                            Resume Booking
                        </Link>
                        
                        <Link 
                            to="/patient/dashboard"
                            className="w-full bg-white text-gray-600 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 border border-gray-100 hover:bg-gray-50 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
