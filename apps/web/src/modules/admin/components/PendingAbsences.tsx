import { Check, X } from "lucide-react"

const absences = [
    { name: "Dr. James Wilson", date: "Oct 12 - Oct 14", reason: "Conference" },
    { name: "Nurse Anna Bates", date: "Oct 15", reason: "Personal Leave" },
    { name: "Dr. Sarah Mitchell", date: "Nov 1 - Nov 5", reason: "Vacation" },
]

export default function PendingAbsences() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <span className="text-xl">📅</span>
                <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Pending Absences</h3>
            </div>

            <div className="flex-1 p-6 space-y-6">
                {absences.map((abs, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">{abs.name}</h4>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">{abs.date} ({abs.reason})</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                <Check className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 mt-auto border-t border-gray-50">
                <button className="w-full py-2.5 text-sm font-bold text-gray-600 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                    View HR Schedule
                </button>
            </div>
        </div>
    )
}
