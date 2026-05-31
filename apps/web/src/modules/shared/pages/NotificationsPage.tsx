import React from "react";
import { Bell, Clock, Trash2, CheckCircle } from "lucide-react";
import { useNotifications } from "@/application/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 md:p-8 font-outfit">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-gray-500 mt-1">Stay updated with your latest activities and alerts.</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all active:scale-95"
              >
                <CheckCircle size={18} />
                Mark all as read
              </button>
            )}
            <button
              onClick={() => clearAll()}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all active:scale-95"
            >
              <Trash2 size={18} />
              Clear all
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="text-gray-200" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-400 max-w-xs mx-auto">
                We'll notify you when something important happens.
              </p>
              <Link
                to="/dashboard"
                className="mt-8 inline-block px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all active:scale-95"
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={`p-6 transition-all cursor-pointer hover:bg-gray-50/50 flex gap-4 ${
                    !notification.isRead ? "bg-blue-50/10" : ""
                  }`}
                >
                  <div className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${!notification.isRead ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-transparent border border-gray-200"}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`text-lg transition-colors ${!notification.isRead ? "font-black text-gray-900" : "font-bold text-gray-600"}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        <Clock size={12} />
                        <span>
                          {(() => {
                            try {
                              return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
                            } catch (e) {
                              return "some time ago";
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                    <p className={`mt-2 text-sm leading-relaxed ${!notification.isRead ? "text-gray-700 font-medium" : "text-gray-400 font-normal"}`}>
                      {notification.message}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {notification.type}
                      </span>
                      {!notification.isRead && (
                         <span className="px-3 py-1 bg-blue-100 rounded-lg text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            New
                         </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-8">
            End of activities
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
