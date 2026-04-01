import Sidebar from "@/modules/patient/components/dashboard/Sidebar"
import TopNav from "@/modules/patient/components/dashboard/TopNav"
import Card from "@/modules/patient/components/ui/Card"
import { Save, Lock } from "lucide-react"
import { usePatientProfile } from "@/application/patient/hooks/usePatientProfile"

export default function PatientProfile() {
    const {
        profile,
        personalInfo,
        setPersonalInfo,
        emergencyContacts,
        setEmergencyContacts,
        passwords,
        setPasswords,
        loading,
        handlePersonalInfoSubmit,
        handleEmergencySubmit,
        handlePasswordSubmit
    } = usePatientProfile();

    console.log("Profile : ", emergencyContacts);

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
                            Manage your personal information and security.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
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
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
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
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, mobile: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="9876543210"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Blood Group</label>
                                            <select
                                                value={personalInfo.bloodGroup}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, bloodGroup: e.target.value })}
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
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Gender</label>
                                            <select
                                                value={personalInfo.gender}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other / Prefer not to say</option>
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
                                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
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
                                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 text-[15px] font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwords.confirmPassword}
                                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
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
            </div>
        </div>
    )
}
