import { useState, useEffect } from "react"
import { updateEmergencyContacts, getPatientProfile } from "@/infrastructure/api/patient.api"
import { User, Phone, Plus, Trash2, HeartPulse, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface Contact {
    name: string;
    mobile: string;
}

interface ValidationErrors {
    name?: string;
    mobile?: string;
}

export default function EmergencyContactsForm() {
    const [contacts, setContacts] = useState<Contact[]>([
        { name: "", mobile: "" }
    ])
    const [errors, setErrors] = useState<ValidationErrors[]>([{}])
    const [isSaving, setIsSaving] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    useEffect(() => {
        fetchContacts()
    }, [])

    const fetchContacts = async () => {
        try {
            const profile = await getPatientProfile()
            if (profile.emergencyContacts && profile.emergencyContacts.length > 0) {
                const existingContacts = profile.emergencyContacts.map((c: any) => ({
                    name: c.name,
                    mobile: c.mobile
                }))
                setContacts(existingContacts)
                setErrors(existingContacts.map(() => ({})))
            }
        } catch (error) {
            console.error("Failed to fetch contacts:", error)
        } finally {
            setIsInitialLoad(false)
        }
    }

    const validateContact = (contact: Contact): ValidationErrors => {
        const errors: ValidationErrors = {}
        
        if (!contact.name) {
            errors.name = "Name is required"
        } else if (contact.name.length < 2) {
            errors.name = "Minimum 2 characters"
        } else if (!/^[a-zA-Z\s]+$/.test(contact.name)) {
            errors.name = "Only letters allowed"
        }

        if (!contact.mobile) {
            errors.mobile = "Mobile is required"
        } else if (!/^\d{10}$/.test(contact.mobile)) {
            errors.mobile = "Must be 10 digits"
        }

        return errors
    }

    const handleAddContact = () => {
        if (contacts.length >= 3) {
            toast.error("Maximum 3 emergency contacts allowed")
            return
        }
        setContacts([...contacts, { name: "", mobile: "" }])
        setErrors([...errors, {}])
    }

    const handleRemoveContact = (index: number) => {
        if (contacts.length === 1) {
            toast.error("At least one emergency contact is required")
            return
        }
        const updatedContacts = contacts.filter((_, i) => i !== index)
        const updatedErrors = errors.filter((_, i) => i !== index)
        setContacts(updatedContacts)
        setErrors(updatedErrors)
    }

    const handleChange = (index: number, field: keyof Contact, value: string) => {
        const updatedContacts = [...contacts]
        updatedContacts[index][field] = value
        setContacts(updatedContacts)

        // Real-time validation
        const contactErrors = validateContact(updatedContacts[index])
        const updatedErrors = [...errors]
        updatedErrors[index] = contactErrors
        setErrors(updatedErrors)
    }

    const handleSubmit = async () => {
        // Final validation check
        const allErrors = contacts.map(c => validateContact(c))
        setErrors(allErrors)

        const hasErrors = allErrors.some(e => Object.keys(e).length > 0)
        if (hasErrors) {
            toast.error("Please fix validation errors before saving")
            return
        }

        try {
            setIsSaving(true)
            await updateEmergencyContacts(contacts)
            toast.success("Emergency contacts updated successfully")
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to update contacts"
            toast.error(message)
        } finally {
            setIsSaving(false)
        }
    }

    if (isInitialLoad) {
        return (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse">
                <div className="h-6 w-48 bg-gray-100 rounded-lg mb-6"></div>
                <div className="space-y-4">
                    <div className="h-20 bg-gray-50 rounded-2xl"></div>
                    <div className="h-20 bg-gray-50 rounded-2xl"></div>
                </div>
            </div>
        )
    }

    const isValid = errors.every(e => Object.keys(e).length === 0)

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                        <HeartPulse className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Emergency Contacts</h3>
                        <p className="text-sm text-gray-500 font-bold">People we should contact in case of emergency</p>
                    </div>
                </div>
                <button
                    onClick={handleAddContact}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Contact
                </button>
            </div>

            <div className="space-y-6">
                {contacts.map((contact, index) => (
                    <div key={index} className="group relative bg-gray-50/50 rounded-3xl p-6 border border-gray-100 hover:border-teal-100 hover:bg-white transition-all duration-300">
                        <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                            Contact #{index + 1}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <User className="w-3.5 h-3.5" /> Full Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={contact.name}
                                        onChange={(e) => handleChange(index, "name", e.target.value)}
                                        placeholder="Enter contact person's name"
                                        className={`w-full bg-white px-5 py-3.5 rounded-2xl text-sm font-bold border outline-none transition-all placeholder:text-gray-300 ${
                                            errors[index].name 
                                                ? 'border-red-200 focus:ring-4 focus:ring-red-500/5' 
                                                : contact.name && !errors[index].name
                                                    ? 'border-teal-100 focus:ring-4 focus:ring-teal-500/5'
                                                    : 'border-gray-100 focus:ring-4 focus:ring-teal-500/5 focus:border-teal-200'
                                        }`}
                                    />
                                    {errors[index].name ? (
                                        <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                    ) : contact.name && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                                    )}
                                </div>
                                {errors[index].name && (
                                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-widest">{errors[index].name}</p>
                                )}
                            </div>

                            {/* Mobile Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Phone className="w-3.5 h-3.5" /> Mobile Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={contact.mobile}
                                        onChange={(e) => handleChange(index, "mobile", e.target.value)}
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                        className={`w-full bg-white px-5 py-3.5 rounded-2xl text-sm font-bold border outline-none transition-all placeholder:text-gray-300 ${
                                            errors[index].mobile 
                                                ? 'border-red-200 focus:ring-4 focus:ring-red-500/5' 
                                                : contact.mobile && !errors[index].mobile
                                                    ? 'border-teal-100 focus:ring-4 focus:ring-teal-500/5'
                                                    : 'border-gray-100 focus:ring-4 focus:ring-teal-500/5 focus:border-teal-200'
                                        }`}
                                    />
                                    {errors[index].mobile ? (
                                        <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                    ) : contact.mobile && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                                    )}
                                </div>
                                {errors[index].mobile && (
                                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-widest">{errors[index].mobile}</p>
                                )}
                            </div>
                        </div>

                        {contacts.length > 1 && (
                            <button
                                onClick={() => handleRemoveContact(index)}
                                className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm group-hover:visible"
                                title="Remove Contact"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-10 flex items-center justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={`px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-3 ${
                        isSaving || !isValid
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                    }`}
                >
                    {isSaving ? "Saving..." : "Save Emergency Contacts"}
                    {!isSaving && <CheckCircle2 className="w-4 h-4" />}
                </button>
            </div>
        </div>
    )
}