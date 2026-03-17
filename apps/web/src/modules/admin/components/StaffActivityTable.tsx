import Badge from "@/modules/patient/components/ui/Badge"

const staffData = [
    { name: "Dr. Sarah Mitchell", role: "PHYSICIAN", dept: "Cardiology", status: "In Consultation", load: "14 / 20", initial: "SM" },
    { name: "Dr. Alan Rick", role: "PHYSICIAN", dept: "General Practice", status: "Available", load: "22 / 30", initial: "AR" },
    { name: "Dr. Priya Wong", role: "PHYSICIAN", dept: "Pediatrics", status: "Off Shift", load: "0 / 0", initial: "PW" },
]

export default function StaffActivityTable() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xl">👥</span>
                    <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Staff Activity Monitor</h3>
                </div>
                <select className="text-xs font-medium text-gray-500 bg-gray-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
                    <option>Filter: All Staff</option>
                </select>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                            <th className="px-6 py-4">Staff Member</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Current Status</th>
                            <th className="px-6 py-4 text-right">Daily Load</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {staffData.map((staff, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[10px] font-bold text-teal-600">
                                            {staff.initial}
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{staff.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="info">{staff.role}</Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                    {staff.dept}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            staff.status === 'Available' ? 'bg-green-500' : 
                                            staff.status === 'Off Shift' ? 'bg-gray-400' : 'bg-orange-500'
                                        }`}></div>
                                        <span className="text-sm text-gray-500 font-medium">{staff.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                    {staff.load}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
