import Card from "@/modules/patient/components/ui/Card"
import Badge from "@/modules/patient/components/ui/Badge"

const appointments = [
    {
        doctor: "Dr. David Chen",
        specialty: "General Medicine",
        date: "Oct 12, 2025",
        status: "Completed",
        initials: "DC"
    },
    {
        doctor: "Dr. Sarah Mitchell",
        specialty: "Cardiology",
        date: "Sep 05, 2025",
        status: "Completed",
        initials: "SM"
    },
    {
        doctor: "Dr. Amit Patel",
        specialty: "Dermatology",
        date: "Aug 22, 2025",
        status: "Completed",
        initials: "DP"
    }
]

export default function AppointmentHistory() {
    return (
        <Card className="border-none shadow-sm rounded-[2rem] p-8 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">Appointment History</h3>
                <button className="text-[12px] font-bold text-blue-600 hover:underline">View All</button>
            </div>

            <div className="space-y-6">
                {appointments.map((apt, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[13px] font-bold text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                {apt.initials}
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-gray-900 leading-tight">{apt.doctor}</p>
                                <p className="text-[12px] font-medium text-gray-400 mt-0.5">{apt.specialty} • {apt.date}</p>
                            </div>
                        </div>
                        <Badge variant="success">{apt.status}</Badge>
                    </div>
                ))}
            </div>
        </Card>
    )
}
