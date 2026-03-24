import React, { useEffect, useState } from 'react';
import { Bell, X, Calendar, CheckCircle, Info, Clock } from 'lucide-react';
import { getDoctorNotifications } from '@/infrastructure/api/doctor.api';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    isRead: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getDoctorNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'APPOINTMENT': return <Calendar className="w-5 h-5 text-teal-600" />;
            case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
            default: return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-6 pt-24 bg-black/20 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Notifications</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Updates</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((item) => (
                            <div 
                                key={item.id} 
                                className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
                                    !item.isRead ? 'bg-teal-50/30 border-teal-100' : 'bg-white border-gray-50'
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        !item.isRead ? 'bg-white' : 'bg-gray-50'
                                    }`}>
                                        {getIcon(item.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-black text-gray-900">{item.title}</h4>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                            {item.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center space-y-3">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                <Bell className="w-8 h-8" />
                            </div>
                            <p className="text-gray-400 font-bold text-sm tracking-tight">No notifications yet</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                    <button className="w-full py-4 text-[11px] font-black text-teal-600 uppercase tracking-widest hover:bg-white rounded-2xl transition-all border border-transparent hover:border-teal-50 shadow-sm">
                        Mark all as read
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
