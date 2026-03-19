import { X, AlertTriangle } from "lucide-react"

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onClose: () => void
    isDestructive?: boolean
    isLoading?: boolean
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onClose,
    isDestructive = false,
    isLoading = false
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        {isDestructive && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    <p className="text-gray-600 font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-end gap-3 flex-wrap">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-8 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center ${
                            isDestructive 
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                        }`}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
