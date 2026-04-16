import Card from "@/modules/patient/components/ui/Card"
import { Download, FileText, Pill, ClipboardList, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

const downloads = [
    { name: "Prescriptions", icon: Pill, color: "text-orange-500", path: "/prescriptions" },
    { name: "Reports", icon: ClipboardList, color: "text-blue-500", path: "/records" },
    { name: "Invoices", icon: FileText, color: "text-gray-400", path: "/billing" },
]

export default function DownloadCenter() {
    const navigate = useNavigate()
    return (
        <Card className="border-none shadow-sm rounded-[2rem] p-8 h-full flex flex-col">
            <h3 className="text-[16px] font-bold text-gray-900 mb-6 tracking-tight">Download Center</h3>

            <div className="space-y-4 flex-1">
                {downloads.map((item, i) => (
                    <div 
                        key={i} 
                        onClick={() => item.path && navigate(item.path)}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <span className="text-[14px] font-bold text-gray-700">{item.name}</span>
                        </div>
                        <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all text-gray-400">
                            <Download className="w-4 h-4" />
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-[14px] hover:border-blue-400 hover:text-blue-600 transition-all group">
                <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                Upload New Report
            </button>
        </Card>
    )
}
