import Card from "@/modules/patient/components/ui/Card"
import Badge from "@/modules/patient/components/ui/Badge"

interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    status: string;
}

interface Props {
    appointments: Appointment[];
}

export default function AppointmentHistory({ appointments }: Props) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusVariant = (status: string): "success" | "warning" | "error" | "info" => {
        switch (status.toUpperCase()) {
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            case 'PENDING': return 'warning';
            default: return 'info';
        }
    };

    return (
        <Card className="border-none shadow-sm rounded-[2rem] p-8 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">Appointment History</h3>
                <button className="text-[12px] font-bold text-blue-600 hover:underline">View All</button>
            </div>

            <div className="space-y-6">
                {appointments && appointments.length > 0 ? (
                    appointments.map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[13px] font-bold text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    {apt.doctorName.split(' ').map(n => n[0]).join('').replace('Dr', '')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">{apt.doctorName}</p>
                                    <p className="text-[12px] font-medium text-gray-400 mt-0.5 truncate">{apt.specialty} • {formatDate(apt.date)}</p>
                                </div>
                            </div>
                            <Badge variant={getStatusVariant(apt.status)}>{apt.status}</Badge>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-sm italic">No past appointments found</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
