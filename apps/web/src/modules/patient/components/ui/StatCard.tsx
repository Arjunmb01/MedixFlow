interface Props {
    icon: React.ReactNode
    value: string | number
    label: string
    subtitle?: React.ReactNode
    iconBg?: string
}

export default function StatCard({ icon, value, label, subtitle, iconBg = "bg-gray-50" }: Props) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 h-full">
            <div className={`p-3 rounded-xl ${iconBg} shrink-0`}>
                {icon}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-gray-900 leading-none truncate">{value}</h3>
                <p className="text-[13px] font-medium text-gray-500 mt-1 truncate">{label}</p>
                
                {subtitle && (
                    <div className="mt-2 text-[11px] leading-tight">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    )
}