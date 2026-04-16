interface Props {
    children: React.ReactNode
    variant?: "success" | "warning" | "error" | "info" | "gray"
}

export default function Badge({ children, variant = "info" }: Props) {
    const variants = {
        success: "bg-green-50 text-green-600 border-green-100",
        warning: "bg-orange-50 text-orange-600 border-orange-100",
        error: "bg-red-50 text-red-600 border-red-100",
        info: "bg-blue-50 text-blue-600 border-blue-100",
        gray: "bg-gray-50 text-gray-500 border-gray-100"
    }

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${variants[variant]}`}>
            {children}
        </span>
    )
}
