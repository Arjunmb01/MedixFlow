import Card from "@/modules/patient/components/ui/Card"
import { Stethoscope, Droplets, Wallet, Bell } from "lucide-react"

const notifications = [
    {
        title: "Follow-up Requested",
        desc: "Dr. David Chen requested a follow-up visit.",
        icon: Stethoscope,
        iconBg: "bg-orange-50 text-orange-600",
    },
    {
        title: "Lab Report Available",
        desc: "Your latest CBC panel was added to Medical Records.",
        icon: Droplets,
        iconBg: "bg-blue-50 text-blue-600",
    },
    {
        title: "Wallet Credit Added",
        desc: "Your top-up of $50 has been processed successfully.",
        icon: Wallet,
        iconBg: "bg-green-50 text-green-600",
    },
    {
        title: "Appointment Reminder",
        desc: "Video consult with Dr. Mitchell starts in 24 hours.",
        icon: Bell,
        iconBg: "bg-gray-50 text-gray-600",
    }
]

export default function NotificationPanel() {
    return (
        <Card className="h-full border-none shadow-sm rounded-[2rem] p-8">
            <h3 className="text-[16px] font-bold text-gray-900 mb-6 tracking-tight">Recent Notifications</h3>

            <div className="space-y-6">
                {notifications.map((n, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${n.iconBg}`}>
                            <n.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-gray-900 leading-tight">
                                {n.title}
                            </p>
                            <p className="text-[12px] font-medium text-gray-500 mt-1 leading-snug">
                                {n.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}