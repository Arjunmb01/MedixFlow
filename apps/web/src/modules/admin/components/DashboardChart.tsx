interface Props {
    title: string
    subtitle?: string
    type: "line" | "bar"
}

export default function DashboardChart({ title, subtitle, type }: Props) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                {type === "bar" && <span className="text-sm font-semibold text-teal-600">+ ₹32,450</span>}
            </div>

            <div className="relative h-[180px] w-full mt-auto">
                {type === "bar" ? (
                    <div className="flex items-end justify-between w-full h-full gap-2 px-1">
                        {[40, 70, 85, 60, 100, 50, 40].map((height, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                                <div 
                                    className="w-full bg-[#14B8A6] rounded-t-lg transition-all hover:opacity-80 cursor-pointer" 
                                    style={{ height: `${height}%` }}
                                ></div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-full relative group">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path 
                                d="M 0 80 C 20 80, 30 20, 50 50 S 80 10, 100 40 L 100 100 L 0 100 Z" 
                                fill="url(#gradient)" 
                            />
                            <path 
                                d="M 0 80 C 20 80, 30 20, 50 50 S 80 10, 100 40" 
                                fill="none" 
                                stroke="#14B8A6" 
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="absolute bottom-1 left-0 w-full flex justify-between px-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight pointer-events-none">
                            <span>Jul</span>
                            <span>Aug</span>
                            <span>Sep</span>
                            <span>Oct</span>
                            <span>Nov</span>
                            <span>Dec</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
