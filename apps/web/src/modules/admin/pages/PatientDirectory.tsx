import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import AdminTopNav from "../components/AdminTopNav"
import { Search, Trash2, ChevronLeft, ChevronRight, User, SlidersHorizontal, X } from "lucide-react"
import ConfirmModal from "../components/ConfirmModal"
import { getPatientsList, deletePatient, updatePatientStatus } from "../services/patient.service"
import { toast } from "sonner"

interface Patient {
    id: string
    patientId: string
    firstName: string
    lastName: string
    phone: string
    gender: string | null
    dob: string | null
    _count: {
        appointments: number
    }
    user: {
        id: string
        email: string
        status: string
        createdAt: string
    }
}

const STATUS_OPTIONS = ["", "ACTIVE", "INACTIVE", "SUSPENDED"] as const
const GENDER_OPTIONS = ["", "MALE", "FEMALE", "OTHER"] as const

export default function PatientDirectory() {
    const navigate = useNavigate()
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("")
    const [gender, setGender] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [page, setPage] = useState(1)
    const [totalActive, setTotalActive] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const [confirmModalConfig, setConfirmModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        actionText: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        actionText: "",
        onConfirm: () => {},
    })

    const activeFilterCount = [status, gender].filter(Boolean).length

    const fetchPatients = async () => {
        setLoading(true)
        try {
            const response = await getPatientsList({ search, status: status || undefined, gender: gender || undefined, page, limit: 10 })
            setPatients(response.data)
            setTotalPages(response.meta.totalPages)
            setTotalActive(response.meta.total)
        } catch (error) {
            console.error("Failed to fetch patients:", error)
            toast.error("Failed to load patients")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deletePatient(id)
            toast.success("Patient deleted successfully")
            fetchPatients()
        } catch (error) {
            console.error("Failed to delete patient:", error)
            toast.error("Failed to delete patient")
        }
    }

    const handleToggleBlock = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        try {
            await updatePatientStatus(id, newStatus)
            toast.success(`Patient account ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`)
            fetchPatients()
        } catch (error) {
            console.error("Failed to update status:", error)
            toast.error("Failed to update patient status")
        }
    }

    const clearFilters = () => {
        setStatus("")
        setGender("")
        setSearch("")
        setPage(1)
    }

    useEffect(() => {
        setPage(1)
    }, [search, status, gender])

    useEffect(() => {
        const timer = setTimeout(fetchPatients, 300)
        return () => clearTimeout(timer)
    }, [search, status, gender, page])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            ACTIVE: 'bg-green-50 text-green-700 border-green-100',
            INACTIVE: 'bg-red-50 text-red-700 border-red-100',
            SUSPENDED: 'bg-amber-50 text-amber-700 border-amber-100',
        }
        const dot: Record<string, string> = {
            ACTIVE: 'bg-green-500',
            INACTIVE: 'bg-red-500',
            SUSPENDED: 'bg-amber-400',
        }
        return { badge: map[s] ?? 'bg-gray-50 text-gray-600 border-gray-100', dot: dot[s] ?? 'bg-gray-400' }
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            
            <main className="flex-1 ml-64 p-8">
                <AdminTopNav title="Patients Control" subtitle="Clinic-wide patient management and registration." />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Patient Database</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {loading ? "Loading..." : `Found ${totalActive} registered patients`}
                            {activeFilterCount > 0 && (
                                <span className="ml-2 text-teal-600 font-bold">
                                    • {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/20 w-72 transition-all font-medium shadow-sm"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(f => !f)}
                            className={`relative p-2.5 rounded-xl border transition-all shadow-sm ${showFilters || activeFilterCount > 0 ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-100 text-gray-400 hover:text-teal-500 hover:bg-teal-50'}`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 flex flex-wrap items-end gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1.5 flex-1 min-w-[160px]">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account Status</label>
                            <select
                                value={status}
                                onChange={e => { setStatus(e.target.value); setPage(1) }}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 transition-all"
                            >
                                <option value="">All Statuses</option>
                                {STATUS_OPTIONS.filter(Boolean).map(s => (
                                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-[160px]">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                            <select
                                value={gender}
                                onChange={e => { setGender(e.target.value); setPage(1) }}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 transition-all"
                            >
                                <option value="">All Genders</option>
                                {GENDER_OPTIONS.filter(Boolean).map(g => (
                                    <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                        </div>

                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 transition-all"
                            >
                                <X className="w-4 h-4" />
                                Clear All
                            </button>
                        )}
                    </div>
                )}

                {/* Patients Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Patient</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact / Email</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Registration Date</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Admin Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-4 h-16 bg-gray-50/30"></td>
                                    </tr>
                                ))
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                                <User className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-medium">No patients found matching your criteria</p>
                                            {(activeFilterCount > 0 || search) && (
                                                <button onClick={clearFilters} className="text-teal-600 font-bold text-sm hover:underline">
                                                    Clear filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => {
                                    const { badge, dot } = statusBadge(patient.user.status)
                                    return (
                                        <tr key={patient.id} className="group hover:bg-gray-50/80 transition-all cursor-pointer">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100/50">
                                                        <span className="text-teal-600 font-bold text-sm">
                                                            {patient.firstName[0]}{patient.lastName[0]}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                                                            {patient.firstName} {patient.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-medium">#{patient.patientId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div>
                                                    <p className="font-bold text-gray-800">{patient.phone}</p>
                                                    <p className="text-xs text-gray-500">{patient.user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-medium text-gray-600">{patient.gender || '—'}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-bold text-gray-700">{formatDate(patient.user.createdAt)}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                                                    {patient.user.status.charAt(0) + patient.user.status.slice(1).toLowerCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/admin/patients/${patient.id}`)}
                                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const actionText = patient.user.status === 'ACTIVE' ? 'block' : 'unblock'
                                                            setConfirmModalConfig({
                                                                isOpen: true,
                                                                title: `${actionText === 'block' ? 'Block' : 'Unblock'} Patient`,
                                                                message: `Are you sure you want to ${actionText} this patient? Their access will immediately be updated.`,
                                                                actionText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
                                                                isDestructive: actionText === 'block',
                                                                onConfirm: () => {
                                                                    setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))
                                                                    handleToggleBlock(patient.id, patient.user.status)
                                                                }
                                                            })
                                                        }}
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border active:scale-95 ${
                                                            patient.user.status === 'ACTIVE'
                                                                ? 'text-amber-600 border-amber-100 bg-amber-50 hover:bg-amber-100'
                                                                : 'text-green-600 border-green-100 bg-green-50 hover:bg-green-100'
                                                        }`}
                                                        title={patient.user.status === 'ACTIVE' ? "Block Patient" : "Unblock Patient"}
                                                    >
                                                        {patient.user.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmModalConfig({
                                                                isOpen: true,
                                                                title: "Delete Patient",
                                                                message: "Are you sure you want to permanently delete this patient? This action cannot be undone.",
                                                                actionText: "Delete Patient",
                                                                isDestructive: true,
                                                                onConfirm: () => {
                                                                    setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))
                                                                    handleDelete(patient.id)
                                                                }
                                                            })
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900 font-bold">{patients.length}</span> of <span className="text-gray-900 font-bold">{totalActive}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-teal-600 disabled:opacity-50 disabled:hover:text-gray-400 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                                            page === i + 1
                                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                                                : 'bg-white text-gray-400 hover:bg-gray-100'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-teal-600 disabled:opacity-50 disabled:hover:text-gray-400 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <ConfirmModal
                isOpen={confirmModalConfig.isOpen}
                title={confirmModalConfig.title}
                message={confirmModalConfig.message}
                confirmText={confirmModalConfig.actionText}
                isDestructive={confirmModalConfig.isDestructive}
                onConfirm={confirmModalConfig.onConfirm}
                onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    )
}
