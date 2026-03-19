import { useState, useEffect, useCallback } from "react"
import DoctorSidebar from "../components/DoctorSidebar"
import DoctorTopNav from "../components/DoctorTopNav"
import { getDoctorProfile, updateDoctorProfile, updateDoctorPassword, updateDoctorSchedules, uploadImage } from "../services/doctor.api"
import { toast } from "sonner"
import Cropper from "react-easy-crop"
import getCroppedImg from "../utils/cropImage"
import { 
    User, 
    Camera, 
    ShieldCheck, 
    Award,
    CheckCircle2,
    X,
    Clock,
    Calendar,
    Crop
} from "lucide-react"

const DAYS = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
]

export default function DoctorProfile() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

    // Cropping states
    const [imageToCrop, setImageToCrop] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)

    // Form states
    const [personalInfo, setPersonalInfo] = useState({
        firstName: "",
        lastName: "",
        specialty: "",
        consultationFee: 0,
        licenseNumber: "",
        phone: "",
        bio: "",
        avatarUrl: ""
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const [schedules, setSchedules] = useState<any[]>([])

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const data = await getDoctorProfile()
            setProfile(data)
            setPersonalInfo({
                firstName: data.firstName,
                lastName: data.lastName,
                specialty: data.specialty,
                consultationFee: data.consultationFee,
                licenseNumber: data.licenseNumber,
                phone: data.phone || "",
                bio: data.bio || "",
                avatarUrl: data.avatarUrl || ""
            })
            
            // Initialize schedules from profile or default
            const existingSchedules = data.schedules || []
            const fullSchedules = DAYS.map(day => {
                const found = existingSchedules.find((s: any) => s.dayOfWeek === day.value)
                return {
                    dayOfWeek: day.value,
                    active: !!found,
                    startTime: found?.startTime || "09:00",
                    endTime: found?.endTime || "17:00",
                    fullDay: found?.fullDay || false,
                    slotDurationMinutes: found?.slotDurationMinutes || 30
                }
            })
            setSchedules(fullSchedules)

        } catch (error) {
            console.error("Failed to fetch profile:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await updateDoctorProfile(personalInfo)
            toast.success("Profile updated successfully")
            fetchProfile()
        } catch (error) {
            console.error("Failed to update profile:", error)
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        setSaving(true)
        try {
            await updateDoctorPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
            toast.success("Password updated successfully")
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update password")
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateSchedules = async () => {
        setSaving(true)
        try {
            const payload = schedules
                .filter(s => s.active)
                .map(s => ({
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    fullDay: s.fullDay,
                    slotDurationMinutes: s.slotDurationMinutes
                }))
            
            await updateDoctorSchedules(payload)
            toast.success("Schedule updated successfully")
            setIsScheduleModalOpen(false)
            fetchProfile()
        } catch (error) {
            console.error("Failed to update schedule:", error)
            toast.error("Failed to update schedule")
        } finally {
            setSaving(false)
        }
    }

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            setImageToCrop(reader.result as string)
            setIsCropModalOpen(true)
        }
        reader.readAsDataURL(file)
        
        // Reset the input value so the same file can be selected again
        e.target.value = ""
    }

    const handleConfirmCrop = async () => {
        if (!imageToCrop || !croppedAreaPixels) return

        setSaving(true)
        try {
            const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels)
            if (!croppedImageBlob) throw new Error("Failed to crop image")

            const file = new File([croppedImageBlob], "profile.jpg", { type: "image/jpeg" })
            const { url } = await uploadImage(file)
            
            setPersonalInfo(prev => ({ ...prev, avatarUrl: url }))
            setProfile(prev => ({ ...prev, avatarUrl: url }))
            setIsCropModalOpen(false)
            setImageToCrop(null)
            toast.success("Image cropped and uploaded. Save changes to persist.")
        } catch (error) {
            console.error("Failed to process image:", error)
            toast.error("Failed to process image")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 flex-col font-outfit">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50 font-outfit">
            <DoctorSidebar />
            
            <div className="flex-1 flex flex-col pl-64">
                <DoctorTopNav 
                    doctorName={`Dr. ${profile?.firstName} ${profile?.lastName}`} 
                    doctorSpecialty={profile?.specialty}
                    avatarUrl={profile?.avatarUrl}
                />

                <main className="p-8 pb-12 max-w-5xl">
                    <div className="flex flex-col gap-1 mb-10">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
                        <p className="text-gray-500 font-medium">Manage your personal information, specialization, and account security.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Sidebar Info Card */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                                {/* FIXED: Removed group-hover:h-28 to prevent card from "moving" */}
                                <div className="absolute top-0 inset-x-0 h-24 bg-teal-50 -z-10"></div>
                                <div className="relative inline-block mb-6">
                                    <div className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-teal-600 font-black text-3xl overflow-hidden">
                                        {personalInfo.avatarUrl ? (
                                            <img src={personalInfo.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-1 right-1 p-2 bg-teal-600 text-white rounded-full border-2 border-white shadow-lg hover:bg-teal-700 transition-all active:scale-95 cursor-pointer">
                                        <Camera className="w-4 h-4" />
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={saving}
                                        />
                                    </label>
                                </div>
                                
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Dr. {profile?.firstName} {profile?.lastName}</h2>
                                <p className="text-teal-600 font-bold text-sm uppercase tracking-widest mt-1">{profile?.specialty}</p>
                                <div className="mt-4 inline-flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    License: {profile?.licenseNumber}
                                </div>

                                <div className="mt-10 pt-8 border-t border-gray-50 text-left space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Availability Snapshot</h4>
                                    <div className="space-y-3">
                                        {schedules.filter(s => s.active).length > 0 ? (
                                            schedules.filter(s => s.active).slice(0, 3).map((s, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs font-bold">
                                                    <span className="text-gray-400 uppercase tracking-wider">{DAYS.find(d => d.value === s.dayOfWeek)?.label}</span>
                                                    <span className="text-gray-900">{s.startTime} - {s.endTime}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No schedule set</p>
                                        )}
                                    </div>
                                    {/* FIXED: Added onClick to open schedule modal */}
                                    <button 
                                        type="button"
                                        onClick={() => setIsScheduleModalOpen(true)}
                                        className="w-full text-center text-teal-600 text-[11px] font-black uppercase tracking-widest hover:underline pt-4"
                                    >
                                        Manage Full Schedule →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Forms Column */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Personal Info Form */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden relative">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-8 px-2 flex items-center gap-3">
                                    <Award className="w-5 h-5 text-teal-500" />
                                    Personal & Professional Info
                                </h3>
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                            <input 
                                                value={personalInfo.firstName}
                                                onChange={e => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                            <input 
                                                value={personalInfo.lastName}
                                                onChange={e => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialization</label>
                                            <input 
                                                value={personalInfo.specialty}
                                                onChange={e => setPersonalInfo({...personalInfo, specialty: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Medical License Number</label>
                                            <input 
                                                value={personalInfo.licenseNumber}
                                                onChange={e => setPersonalInfo({...personalInfo, licenseNumber: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Consultation Fee (₹)</label>
                                            <input 
                                                type="number"
                                                value={personalInfo.consultationFee}
                                                onChange={e => setPersonalInfo({...personalInfo, consultationFee: Number(e.target.value)})}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input 
                                                value={personalInfo.phone}
                                                onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-teal-500/10 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Bio</label>
                                        <textarea 
                                            rows={4}
                                            value={personalInfo.bio}
                                            onChange={e => setPersonalInfo({...personalInfo, bio: e.target.value})}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/10 transition-all resize-none"
                                            placeholder="Board-certified specialist with a decade of experience..."
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 flex justify-end gap-3">
                                        <button type="button" onClick={fetchProfile} className="px-8 py-3.5 bg-gray-50 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel Changes</button>
                                        <button 
                                            type="submit" 
                                            disabled={saving}
                                            className="px-10 py-3.5 bg-teal-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-200 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {saving ? "Saving..." : "Save Profile Changes"}
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Security Form */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden relative">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-8 px-2 flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-teal-500" />
                                    Account Security
                                </h3>
                                <form onSubmit={handleUpdatePassword} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                                            <input 
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-black tracking-widest focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:tracking-normal placeholder:font-medium text-gray-400"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                            <input 
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-black tracking-widest focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:tracking-normal placeholder:font-medium text-gray-400"
                                                placeholder="At least 8 characters"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                            <input 
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-black tracking-widest focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:tracking-normal placeholder:font-medium text-gray-400"
                                                placeholder="Re-enter new password"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={saving}
                                            className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? "Updating..." : "Update Security Access"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Schedule Management Modal */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Weekly Availability</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Manage your clinical sessions</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                            {schedules.map((day, index) => (
                                <div key={day.dayOfWeek} className={`p-5 rounded-3xl border transition-all ${day.active ? 'bg-teal-50/30 border-teal-100 shadow-sm' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => {
                                                    const updated = [...schedules]
                                                    updated[index].active = !updated[index].active
                                                    setSchedules(updated)
                                                }}
                                                className={`w-12 h-6 rounded-full relative transition-colors ${day.active ? 'bg-teal-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${day.active ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                            <span className={`text-sm font-black ${day.active ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {DAYS.find(d => d.value === day.dayOfWeek)?.label}
                                            </span>
                                        </div>

                                        {day.active && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-teal-100">
                                                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                                                    <input 
                                                        type="time" 
                                                        value={day.startTime}
                                                        onChange={(e) => {
                                                            const updated = [...schedules]
                                                            updated[index].startTime = e.target.value
                                                            setSchedules(updated)
                                                        }}
                                                        className="bg-transparent border-none text-[11px] font-black p-0 focus:ring-0"
                                                    />
                                                </div>
                                                <span className="text-gray-300 text-xs font-bold">to</span>
                                                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-teal-100">
                                                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                                                    <input 
                                                        type="time" 
                                                        value={day.endTime}
                                                        onChange={(e) => {
                                                            const updated = [...schedules]
                                                            updated[index].endTime = e.target.value
                                                            setSchedules(updated)
                                                        }}
                                                        className="bg-transparent border-none text-[11px] font-black p-0 focus:ring-0"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {day.active && (
                                        <div className="mt-4 pt-4 border-t border-teal-100/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={day.fullDay}
                                                        onChange={(e) => {
                                                            const updated = [...schedules]
                                                            updated[index].fullDay = e.target.checked
                                                            if (e.target.checked) {
                                                                updated[index].startTime = "00:00"
                                                                updated[index].endTime = "23:59"
                                                            }
                                                            setSchedules(updated)
                                                        }}
                                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">24 Hr Session</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slot Duration:</span>
                                                <select 
                                                    value={day.slotDurationMinutes}
                                                    onChange={(e) => {
                                                        const updated = [...schedules]
                                                        updated[index].slotDurationMinutes = Number(e.target.value)
                                                        setSchedules(updated)
                                                    }}
                                                    className="bg-white border-none rounded-lg text-[10px] font-black px-2 py-1 focus:ring-0 text-teal-700"
                                                >
                                                    <option value={15}>15 MIN</option>
                                                    <option value={30}>30 MIN</option>
                                                    <option value={45}>45 MIN</option>
                                                    <option value={60}>60 MIN</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="px-8 py-3.5 bg-white text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all"
                            >
                                Discard
                            </button>
                            <button 
                                onClick={handleUpdateSchedules}
                                disabled={saving}
                                className="px-10 py-3.5 bg-teal-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-200 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Apply Availability"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Crop Image Modal */}
            {isCropModalOpen && imageToCrop && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                                    <Crop className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Crop Profile Image</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Adjust your photo for the best look</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsCropModalOpen(false)
                                    setImageToCrop(null)
                                }}
                                className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative h-80 bg-gray-900 m-8 rounded-3xl overflow-hidden">
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="px-8 pb-4">
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                            />
                            <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>Zoom Out</span>
                                <span>Zoom In</span>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                onClick={() => {
                                    setIsCropModalOpen(false)
                                    setImageToCrop(null)
                                }}
                                className="px-8 py-3.5 bg-white text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmCrop}
                                disabled={saving}
                                className="px-10 py-3.5 bg-teal-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-200 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? "Processing..." : "Apply & Upload"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
