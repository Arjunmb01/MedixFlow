import { useState } from "react"
import { 
    Building2, 
    Clock, 
    Palette, 
    Bell, 
    ShieldCheck, 
    Activity
} from "lucide-react"

import AdminSidebar from "../components/AdminSidebar"
import ClinicProfile from "../components/settings/ClinicProfile"
import BrandingSettings from "../components/settings/BrandingSettings"

const sections = [
    {
        id: "settings",
        label: "SETTINGS",
        items: [
            { id: "profile", label: "Clinic Profile", icon: Building2 },
            { id: "hours", label: "Working Hours", icon: Clock },
            { id: "branding", label: "Branding", icon: Palette },
        ]
    },
    {
        id: "system",
        label: "SYSTEM",
        items: [
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "roles", label: "Role Permissions", icon: ShieldCheck },
            { id: "vitals", label: "Vitals Config", icon: Activity },
        ]
    }
]

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState("profile")

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <ClinicProfile />
            case "branding":
                return <BrandingSettings />
            default:
                return (
                    <div className="bg-white rounded-[32px] p-12 border border-gray-100 min-h-[500px] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                            <Activity className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Section Under Construction</h3>
                        <p className="text-gray-400 font-bold max-w-xs uppercase tracking-widest text-[11px]">
                            {activeTab.replace("-", " ")} configuration is coming soon to the MedixFlow workspace.
                        </p>
                    </div>
                )
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            
            <main className="flex-1 ml-64 p-8 font-outfit">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Configuration</h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[12px]">Manage clinic-wide settings, permissions, and preferences.</p>
                </div>

                <div className="flex gap-10">
                    {/* Secondary Sidebar */}
                    <aside className="w-72 flex-shrink-0 space-y-10">
                        {sections.map((section) => (
                            <div key={section.id} className="space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">{section.label}</h3>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = activeTab === item.id
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                                                    isActive 
                                                    ? "bg-primary-50 text-primary-600 shadow-sm" 
                                                    : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-900"
                                                }`}
                                            >
                                                <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                                                <span className={`text-[14px] font-bold ${isActive ? "text-primary-600" : "text-gray-500"}`}>{item.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 max-w-4xl">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    )
}
