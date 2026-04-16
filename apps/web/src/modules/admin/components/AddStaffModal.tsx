import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Clock } from "lucide-react"
import { toast } from "sonner"
import ConfirmModal from "./ConfirmModal"
import { createDoctor, updateStaffDoctor } from "@/infrastructure/api/staff.api"
import type { DoctorProfile } from "@/domain/doctor/types/doctor.types"
import { SPECIALTY_OPTIONS } from "../types/specialty"

const schema = z.object({
    firstName: z.string()
        .regex(/^[a-zA-Z\s]+$/, "First name should only contain letters")
        .min(1, "First name is required")
        .max(30, "First name cannot exceed 30 characters"),
    lastName: z.string()
        .regex(/^[a-zA-Z\s]+$/, "Last name should only contain letters")
        .min(1, "Last name is required")
        .max(30, "Last name cannot exceed 30 characters"),
    email: z.string().email("Invalid email address").max(30, "Email cannot exceed 30 characters"),
    phone: z.string()
        .regex(/^\d+$/, "Phone must only contain numbers")
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number cannot exceed 15 characters"),
    specialty: z.string().min(1, "Specialization is required").max(20, "Specialization cannot exceed 20 characters"),
    consultationFee: z.number().min(0, "Invalid fee"),
    licenseNumber: z.string().min(1, "License number is required").max(20, "License number cannot exceed 20 characters"),
    slotDuration: z.number().default(30),
    schedules: z.array(z.object({
        dayOfWeek: z.number(),
        active: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
        fullDay: z.boolean()
    }))
}).refine(data => (data.firstName.length + data.lastName.length) <= 20, {
    message: "Total length of first and last name cannot exceed 20 characters",
    path: ["firstName"]
})

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    staffToEdit?: DoctorProfile | null
}

const days = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 0 },
]

export default function AddStaffModal({ isOpen, onClose, onSuccess, staffToEdit }: Props) {
    const [loading, setLoading] = useState(false)
    const [setupUrl, setSetupUrl] = useState<string | null>(null)

    const [showConfirm, setShowConfirm] = useState(false)
    const [pendingData, setPendingData] = useState<any>(null)

    const { register, control, handleSubmit, formState: { errors }, watch, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            specialty: "",
            consultationFee: 0,
            licenseNumber: "",
            slotDuration: 30,
            schedules: days.map(day => ({
                dayOfWeek: day.value,
                active: day.value !== 0, 
                startTime: "09:00",
                endTime: "17:30",
                fullDay: false
            }))
        }
    })

    const { fields } = useFieldArray({
        control,
        name: "schedules"
    })

    useEffect(() => {
        if (staffToEdit) {
            reset({
                firstName: staffToEdit.firstName,
                lastName: staffToEdit.lastName,
                email: staffToEdit.user.email,
                phone: staffToEdit.phone || "",
                specialty: staffToEdit.specialty,
                consultationFee: staffToEdit.consultationFee,
                licenseNumber: staffToEdit.licenseNumber,
                slotDuration: staffToEdit.schedules?.[0]?.slotDurationMinutes || 30,
                schedules: days.map(day => {
                    const existing = (staffToEdit.schedules || []).find((s: any) => s.dayOfWeek === day.value)
                    return {
                        dayOfWeek: day.value,
                        active: !!existing,
                        startTime: existing?.startTime || "09:00",
                        endTime: existing?.endTime || "17:30",
                        fullDay: existing?.fullDay || false
                    }
                })
            })
        } else {
            reset({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                specialty: "",
                consultationFee: 0,
                licenseNumber: "",
                slotDuration: 30,
                schedules: days.map(day => ({
                    dayOfWeek: day.value,
                    active: day.value !== 0, 
                    startTime: "09:00",
                    endTime: "17:30",
                    fullDay: false
                }))
            })
        }
    }, [staffToEdit, reset])

    const onSubmit = (data: any) => {
        setPendingData(data)
        setShowConfirm(true)
    }

    const processSubmit = async () => {
        const data = pendingData
        if (!data) return

        setShowConfirm(false)
        setLoading(true)
        setSetupUrl(null)
        try {
            const payload = {
                ...data,
                schedules: (data.schedules as any[])
                    .filter((s: any) => s.active)
                    .map((s: any) => ({
                        dayOfWeek: s.dayOfWeek,
                        startTime: s.fullDay ? "00:00" : s.startTime,
                        endTime: s.fullDay ? "23:59" : s.endTime,
                        fullDay: s.fullDay,
                        slotDuration: data.slotDuration
                    }))
            }
            
            if (staffToEdit) {
                await updateStaffDoctor(staffToEdit.id, payload)
                toast.success("Staff profile updated successfully")
                onSuccess()
                onClose()
            } else {
                const result = await createDoctor(payload as any)
                toast.success("Doctor account created successfully")
                setSetupUrl(result.setupLink)
                onSuccess()
            }
        } catch (error: any) {
            console.error(error)
            const msg = error.response?.data?.error || error.response?.data?.message || "Failed to process staff member"
            toast.error(typeof msg === 'string' ? msg : "Validation failed. Please check your inputs.")
        } finally {
            setLoading(false)
            setPendingData(null)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-outfit">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {staffToEdit ? "Update Staff Profile" : "Register Staff"}
                    </h2>
                    <button type="button" onClick={() => { setSetupUrl(null); onClose(); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto">
                    {setupUrl ? (
                         <div className="p-12 text-center space-y-8 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                                <Clock className="w-10 h-10 text-emerald-600" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">Staff Created Successfully!</h3>
                                <p className="text-gray-500 text-sm max-w-[280px] mx-auto">Please share this secure setup link with the doctor to activate their account.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between gap-4 border border-gray-100 max-w-md mx-auto">
                                <code className="text-[11px] text-gray-600 font-mono break-all line-clamp-1 flex-1 text-left">{setupUrl}</code>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(setupUrl)
                                        toast.success("Link copied to clipboard!")
                                    }}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 whitespace-nowrap"
                                >
                                    Copy Link
                                </button>
                            </div>

                            <button 
                                type="button"
                                onClick={() => { setSetupUrl(null); onClose(); }}
                                className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-gray-900/10 hover:bg-gray-800 transition-all active:scale-95"
                            >
                                Finish & Close
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">

                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role Classification</label>
                                    <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-xl border border-teal-100 font-bold text-sm">
                                        Doctor
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input 
                                                {...register("firstName")}
                                                placeholder="First Name"
                                                maxLength={30}
                                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                                            />
                                            <input 
                                                {...register("lastName")}
                                                placeholder="Last Name"
                                                maxLength={30}
                                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                                            />
                                        </div>
                                        {(errors.firstName || errors.lastName) && (
                                            <p className="text-xs text-red-500 font-medium">Please enter a valid name (letters only)</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                        <input 
                                            {...register("email")}
                                            type="email"
                                            placeholder="name@medixflow.com"
                                            maxLength={30}
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                                        />
                                        {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Phone</label>
                                        <input 
                                            {...register("phone")}
                                            placeholder="5550000000"
                                            maxLength={15}
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                                        />
                                        {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Medical Details */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Schedule & Availability</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Slot Duration</span>
                                        <select 
                                            {...register("slotDuration", { valueAsNumber: true })}
                                            className="bg-gray-50 border-none rounded-lg text-xs font-bold px-3 py-1.5 focus:ring-0"
                                        >
                                            <option value={15}>15m</option>
                                            <option value={30}>30m</option>
                                            <option value={45}>45m</option>
                                            <option value={60}>60m</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {fields.map((field, index) => {
                                        const isActive = watch(`schedules.${index}.active`)
                                        const isFullDay = watch(`schedules.${index}.fullDay`)
                                        return (
                                            <div key={field.id} className="flex items-center gap-4 group">
                                                <div className="w-24">
                                                    <span className={`text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                                                        {days.find(d => d.value === field.dayOfWeek)?.label}
                                                    </span>
                                                </div>
                                                
                                                <label className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-teal-500' : 'bg-gray-200'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        {...register(`schedules.${index}.active`)} 
                                                        className="sr-only"
                                                    />
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </label>

                                                <div className={`flex flex-1 items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                                    <div className={`flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2 text-sm ${isFullDay ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                        <input 
                                                            type="time" 
                                                            {...register(`schedules.${index}.startTime`)} 
                                                            className="bg-transparent border-none p-0 focus:ring-0 w-full font-medium" 
                                                        />
                                                    </div>
                                                    <span className="text-gray-400 text-[10px] font-bold">TO</span>
                                                    <div className={`flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2 text-sm ${isFullDay ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                        <input 
                                                            type="time" 
                                                            {...register(`schedules.${index}.endTime`)} 
                                                            className="bg-transparent border-none p-0 focus:ring-0 w-full font-medium" 
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 ml-4 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            {...register(`schedules.${index}.fullDay`)} 
                                                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" 
                                                        />
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Full Day</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Medical Experience */}
                            <div className="space-y-4">
                                 <div className="space-y-2">
                                     <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Medical Specialization</label>
                                     <select 
                                        {...register("specialty")}
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                                    >
                                        <option value="">Select Specialization</option>
                                        {SPECIALTY_OPTIONS.map(sp => (
                                            <option key={sp} value={sp}>{sp}</option>
                                        ))}
                                    </select>
                                    {errors.specialty && <p className="text-xs text-red-500 font-medium">{errors.specialty.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Consultation Fee (₹)</label>
                                        <input 
                                            {...register("consultationFee", { valueAsNumber: true })}
                                            type="number"
                                            placeholder="150.00"
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                                        />
                                        {errors.consultationFee && <p className="text-xs text-red-500 font-medium">{errors.consultationFee.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">License Number</label>
                                        <input 
                                            {...register("licenseNumber")}
                                            placeholder="MED-XXXX"
                                            maxLength={20}
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                                        />
                                        {errors.licenseNumber && <p className="text-xs text-red-500 font-medium">{errors.licenseNumber.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:text-gray-700 transition-all text-xs"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50 text-xs active:scale-95"
                                >
                                    {loading ? "Registering..." : (staffToEdit ? "Save Changes" : "Create Account")}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <ConfirmModal 
                isOpen={showConfirm}
                title={staffToEdit ? "Confirm Update" : "Confirm Registration"}
                message={staffToEdit ? "Are you sure you want to save the changes to this staff profile?" : "Are you sure you want to register this new staff member?"}
                confirmText={staffToEdit ? "Save Changes" : "Create Account"}
                onConfirm={processSubmit}
                onClose={() => setShowConfirm(false)}
            />
        </div>
    )
}
