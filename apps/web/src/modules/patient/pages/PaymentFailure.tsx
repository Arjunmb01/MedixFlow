import { Link } from "react-router-dom"
import { XCircle, RefreshCcw, ArrowLeft, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function PaymentFailure() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-red-900/5 overflow-hidden border border-gray-100"
            >
                <div className="bg-red-500 p-10 text-center text-white relative overflow-hidden">
                    <motion.div 
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="relative z-10 inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-4"
                    >
                        <XCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black relative z-10 uppercase tracking-tight">Payment Failed</h1>
                    <p className="text-red-100 mt-2 relative z-10 font-medium">Something went wrong with the transaction</p>
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                </div>

                <div className="p-8">
                    <div className="bg-red-50 rounded-3xl p-6 border border-red-100 mb-8 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                        <div>
                            <h3 className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Common Issues</h3>
                            <p className="text-xs text-red-700 leading-relaxed font-medium">
                                • Insufficient funds in your account<br/>
                                • Card expired or declined by bank<br/>
                                • Unstable internet connection during checkout
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link 
                            to="/patient/doctors"
                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Retry Booking
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
