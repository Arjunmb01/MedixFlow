import Card from "@/modules/patient/components/ui/Card"
import { Bell, Calendar, ClipboardList, Info } from "lucide-react"

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
}

interface Props {
    notifications: Notification[];
}

export default function NotificationPanel({ notifications }: Props) {
    const getIcon = (type: string) => {
        switch (type) {
            case "APPOINTMENT":
                return { icon: Calendar, bg: "bg-blue-50 text-blue-600" };
            case "FOLLOW_UP":
                return { icon: ClipboardList, bg: "bg-orange-50 text-orange-600" };
            default:
                return { icon: Bell, bg: "bg-gray-50 text-gray-600" };
        }
    };

    return (
        <Card className="h-full border-none shadow-sm rounded-[2rem] p-8">
            <h3 className="text-[16px] font-bold text-gray-900 mb-6 tracking-tight">Recent Notifications</h3>

            <div className="space-y-6">
                {notifications.length > 0 ? (
                    notifications.map((n) => {
                        const { icon: Icon, bg } = getIcon(n.type);
                        return (
                            <div key={n.id} className="flex gap-4 group cursor-pointer">
                                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${bg}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">
                                        {n.title}
                                    </p>
                                    <p className="text-[12px] font-medium text-gray-500 mt-1 leading-snug line-clamp-2">
                                        {n.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No new notifications</p>
                    </div>
                )}
            </div>
        </Card>
    );
}