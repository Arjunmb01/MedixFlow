import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import { 
    getPatientById as getPatientDetails, 
    updatePatientStatus, 
    deletePatient 
} from "@/infrastructure/api/patient.api"
import { 
    User, 
    Phone, 
    Mail, 
    Calendar, 
    Droplets, 
    ChevronLeft,
    ShieldAlert,
    Trash2,
    CheckCircle2,
    XCircle
} from "lucide-react"
import { toast } from "sonner"

interface PatientDetails {
    id: string
    patientId: string
    firstName: string
    lastName: string
    phone: string
    gender: string | null
    dob: string | null
    bloodGroup: string | null
    user: {
        id: string
        email: string
        status: string
        createdAt: string
    }
    emergencyContacts: Array<{
        id: string
        name: string
        mobile: string
    }>
    _count?: {
        appointments: number
    }
}

export default function PatientDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [patient, setPatient] = useState<PatientDetails | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchDetails = async () => {
        if (!id) return
        setLoading(true)
        try {
            const data = await getPatientDetails(id)
            setPatient(data)
        } catch (error) {
            console.error("Failed to fetch patient details:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDetails()
    }, [id])

    const handleToggleStatus = async () => {
        if (!patient) return
        const newStatus = patient.user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        try {
            await updatePatientStatus(patient.id, newStatus)
            toast.success(`Patient account ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`)
            fetchDetails()
        } catch (error) {
            console.error("Failed to update status:", error)
            toast.error("Failed to update patient status")
        }
    }

    const handleDelete = async () => {
        if (!patient) return
        if (!window.confirm("Are you sure you want to delete this patient profile? This action cannot be undone.")) return
        try {
            await deletePatient(patient.id)
            toast.success("Patient profile deleted successfully")
            navigate("/admin/patients")
        } catch (error) {
            console.error("Failed to delete patient:", error)
            toast.error("Failed to delete patient profile")
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50/50">
                <AdminSidebar />
                <main className="flex-1 ml-64 p-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </main>
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="flex min-h-screen bg-gray-50/50">
                <AdminSidebar />
                <main className="flex-1 ml-64 p-8">
                    <div className="text-center py-20">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 font-outfit">Patient Not Found</h2>
                        <button 
                            onClick={() => navigate("/admin/patients")}
                            className="mt-4 text-teal-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Directory
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            
            <main className="flex-1 ml-64 p-8">
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate("/admin/patients")}
                        className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 font-outfit">Patient Profile</h2>
                        <p className="text-sm text-gray-500">Management & Detail View</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8">
                                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border ${
                                    patient.user.status === 'ACTIVE' 
                                    ? 'bg-green-50 text-green-700 border-green-100' 
                                    : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${patient.user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {patient.user.status} Patient
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row items-start gap-8">
                                <div className="w-24 h-24 rounded-3xl bg-teal-50 flex items-center justify-center border border-teal-100/50 shrink-0">
                                    <span className="text-teal-600 font-bold text-3xl">
                                        {patient.firstName[0]}{patient.lastName[0]}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-outfit">
                                        {patient.firstName} {patient.lastName}
                                    </h1>
                                    <p className="text-gray-500 font-medium mb-6 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-teal-500" />
                                        Medical ID: <span className="text-gray-900 font-bold">#{patient.patientId}</span>
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Gender</p>
                                            <p className="text-gray-900 font-bold">{patient.gender || 'Not specified'}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Blood Group</p>
                                            <p className="text-gray-900 font-bold flex items-center gap-1.5">
                                                <Droplets className="w-3.5 h-3.5 text-red-500" />
                                                {patient.bloodGroup || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Date of Birth</p>
                                            <p className="text-gray-900 font-bold">{patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contacts */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 font-outfit">
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                Emergency Contacts
                            </h3>
                            {patient.emergencyContacts.length === 0 ? (
                                <p className="text-gray-500 text-sm italic py-4">No emergency contacts registered.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {patient.emergencyContacts.map(contact => (
                                        <div key={contact.id} className="p-5 bg-red-50/30 rounded-2xl border border-red-100/50">
                                            <p className="font-bold text-gray-900 mb-1">{contact.name}</p>
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5" />
                                                {contact.mobile}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar Info / Actions */}
                    <div className="space-y-8">
                        {/* Contact Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 font-outfit">Contact Details</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">Phone Number</p>
                                        <p className="text-gray-900 font-bold">{patient.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">Email Address</p>
                                        <p className="text-gray-900 font-bold">{patient.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">Join Date</p>
                                        <p className="text-gray-900 font-bold">{new Date(patient.user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="bg-gray-900 rounded-3xl shadow-xl shadow-gray-200 p-8 text-white">
                            <h3 className="text-lg font-bold mb-6 font-outfit">Administrative Controls</h3>
                            <div className="space-y-4">
                                <button 
                                    onClick={handleToggleStatus}
                                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                        patient.user.status === 'ACTIVE'
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                        : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                                    }`}
                                >
                                    {patient.user.status === 'ACTIVE' ? (
                                        <><XCircle className="w-4 h-4" /> Suspend Account</>
                                    ) : (
                                        <><CheckCircle2 className="w-4 h-4" /> Activate Account</>
                                    )}
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="w-full py-3.5 px-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-sm text-white/50 flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Profile
                                </button>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                                <p className="text-xs text-white/40 font-medium">All administrative actions are logged.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
