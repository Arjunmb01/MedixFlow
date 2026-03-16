import { useState, useEffect } from "react"
import Sidebar from "@/modules/patient/components/dashboard/Sidebar"
import TopNav from "@/modules/patient/components/dashboard/TopNav"
import Card from "@/modules/patient/components/ui/Card"
import { Sparkles, Save, Lock } from "lucide-react"
import { getPatientProfile, updatePatientProfile, updateEmergencyContacts, updatePassword } from "../services/patient.api"
import type { PatientProfile as PatientProfileType, EmergencyContact } from "../types/patient.types"

export default function PatientProfile() {
    const [profile, setProfile] = useState<PatientProfileType | null>(null)
    const [personalInfo, setPersonalInfo] = useState({
        name: "",
        mobile: "",
        bloodGroup: ""
    })
    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
        { name: "", mobile: "" },
        { name: "", mobile: "" }
    ])
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getPatientProfile()
                setProfile(data)
                setPersonalInfo({
                    name: data.name,
                    mobile: data.mobile,
                    bloodGroup: data.bloodGroup || ""
                })
                if (data.emergencyContacts?.length > 0) {
                    const contacts = [...data.emergencyContacts]
                    while (contacts.length < 2) contacts.push({ name: "", mobile: "" })
                    setEmergencyContacts(contacts)
                }
            } catch (error) {
                console.error("Failed to fetch profile", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updatePatientProfile(personalInfo)
            setMessage({ type: 'success', text: "Personal information updated successfully!" })
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update personal information." })
        }
    }

    const handleEmergencySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateEmergencyContacts(emergencyContacts)
            setMessage({ type: 'success', text: "Emergency contacts updated successfully!" })
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update emergency contacts." })
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match." })
            return
        }
        try {
            await updatePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            })
            setMessage({ type: 'success', text: "Password updated successfully!" })
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update password. Please check your current password." })
        }
    }

    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-64">
                <TopNav 
                    userName={`${profile.name}`} 
                    patientId={profile.patientId || "PX-202"} 
                    title="Profile Settings"
                />

                <main className="pt-28 pb-12 px-8">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">
                            Account Settings
                        </h1>
                        <p className="text-[16px] font-medium text-gray-500 mt-2">
                            Manage your personal information, security, and notifications.
                        </p>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-2xl border ${
                            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                        } text-sm font-medium animate-in fade-in slide-in-from-top-4`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-8">
                        {/* Main Settings */}
                        <div className="col-span-2 space-y-8">
                            {/* Personal Information */}
                            <Card className="border-none shadow-sm rounded-[2rem] p-8">
                                <h3 className="text-[18px] font-bold text-gray-900 mb-6 tracking-tight">Personal Information</h3>
                                <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Name</label>
                                            <input 
                                                type="text" 
                                                value={personalInfo.name}
                                                onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="Arjun Sharma"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                                            <input 
                                                type="email" 
                                                value={profile.email}
                                                disabled
                                                className="w-full bg-gray-100 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-400 cursor-not-allowed outline-none"
                                                placeholder="arjun@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Mobile</label>
                                            <input 
                                                type="text" 
                                                value={personalInfo.mobile}
                                                onChange={(e) => setPersonalInfo({...personalInfo, mobile: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="9876543210"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Blood Group</label>
                                            <select 
                                                value={personalInfo.bloodGroup}
                                                onChange={(e) => setPersonalInfo({...personalInfo, bloodGroup: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Choose Blood Group</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                </form>
                            </Card>

                            {/* Security */}
                            <Card className="border-none shadow-sm rounded-[2rem] p-8">
                                <h3 className="text-[18px] font-bold text-gray-900 mb-2 tracking-tight">Security</h3>
                                <p className="text-[14px] font-medium text-gray-400 mb-8">Change your password regularly to keep your account secure.</p>
                                
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Current Password</label>
                                            <input 
                                                type="password" 
                                                value={passwords.currentPassword}
                                                onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div></div> {/* Spacer */}
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">New Password</label>
                                            <input 
                                                type="password" 
                                                value={passwords.newPassword}
                                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm New Password</label>
                                            <input 
                                                type="password" 
                                                value={passwords.confirmPassword}
                                                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold text-[14px] hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                                    >
                                        <Lock className="w-4 h-4" />
                                        Update Password
                                    </button>
                                </form>
                            </Card>
                        </div>

                        {/* Emergency Contact Sidebar */}
                        <div className="col-span-1">
                            <Card className="border-none shadow-sm rounded-[2rem] p-8">
                                <h3 className="text-[18px] font-bold text-gray-900 mb-8 tracking-tight">Emergency Contact</h3>
                                <form onSubmit={handleEmergencySubmit} className="space-y-8">
                                    {emergencyContacts.map((contact, index) => (
                                        <div key={index} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                                                    Emergency contact Name {index + 1} :
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={contact.name}
                                                    onChange={(e) => {
                                                        const newContacts = [...emergencyContacts]
                                                        newContacts[index].name = e.target.value
                                                        setEmergencyContacts(newContacts)
                                                    }}
                                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    placeholder="Arjun Sharma"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Mobile</label>
                                                <input 
                                                    type="text" 
                                                    value={contact.mobile}
                                                    onChange={(e) => {
                                                        const newContacts = [...emergencyContacts]
                                                        newContacts[index].mobile = e.target.value
                                                        setEmergencyContacts(newContacts)
                                                    }}
                                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    placeholder="9876543210"
                                                />
                                            </div>
                                            {index === 0 && <div className="border-b border-gray-100 my-2"></div>}
                                        </div>
                                    ))}
                                    <button 
                                        type="submit"
                                        className="w-full bg-blue-50 text-blue-600 py-3 rounded-2xl font-bold text-[14px] hover:bg-blue-100 transition-all"
                                    >
                                        Update Contacts
                                    </button>
                                </form>
                            </Card>
                        </div>
                    </div>
                </main>

                {/* Floating Action Button */}
                {/* <button className="fixed bottom-10 right-10 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-400 hover:scale-110 transition-transform z-20 group">
                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </button> */}
            </div>
        </div>
    )
}
