import { useState, useEffect } from "react"
import AdminSidebar from "../components/AdminSidebar"
import AdminTopNav from "../components/AdminTopNav"
import AddStaffModal from "../components/AddStaffModal"
import { Search, UserPlus, Edit2, Trash2, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react"
import ConfirmModal from "../components/ConfirmModal"
import { useStaffManagement } from "@/application/staff/hooks/useStaffManagement"
import { SPECIALTY_OPTIONS } from "../types/specialty"

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const

export default function StaffDirectory() {
    const {
        doctors: staff,
        loading,
        stats,
        fetchDoctors: fetchStaff,
        handleBlockDoctor,
        handleDeleteDoctor
    } = useStaffManagement();

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [staffToEdit, setStaffToEdit] = useState<any | null>(null)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("")
    const [specialty, setSpecialty] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [page, setPage] = useState(1)

    const totalActive = stats?.total || 0;
    const totalPages = stats?.totalPages || 1;

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

    const activeFilterCount = [status, specialty].filter(Boolean).length

    useEffect(() => {
        setPage(1)
    }, [search, status, specialty])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStaff({
                search: search || undefined,
                status: status || undefined,
                specialty: specialty || undefined,
                page,
                limit: 10
            })
        }, 300)
        return () => clearTimeout(timer)
    }, [search, status, specialty, page, fetchStaff])

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        await handleBlockDoctor(id, currentStatus);
    }

    const handleEdit = (member: any) => {
        setStaffToEdit(member)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        await handleDeleteDoctor(id);
    }

    const clearFilters = () => {
        setSearch("")
        setStatus("")
        setSpecialty("")
        setPage(1)
    }

    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            ACTIVE: 'bg-teal-50 text-teal-700 border-teal-100',
            INACTIVE: 'bg-amber-50 text-amber-700 border-amber-100',
            SUSPENDED: 'bg-red-50 text-red-700 border-red-100',
            BLOCKED: 'bg-red-50 text-red-700 border-red-100',
        }
        const dot: Record<string, string> = {
            ACTIVE: 'bg-teal-500',
            INACTIVE: 'bg-amber-400',
            SUSPENDED: 'bg-red-500',
            BLOCKED: 'bg-red-500',
        }
        return { badge: map[s] ?? 'bg-gray-50 text-gray-600 border-gray-100', dot: dot[s] ?? 'bg-gray-400' }
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            
            <main className="flex-1 ml-64 p-8">
                <AdminTopNav title="Staff Management" subtitle="Manage clinical personnel, access, and operational roles." />

                {/* Directory Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Staff Directory</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {loading ? "Loading..." : `Found ${totalActive} staff members`}
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
                                placeholder="Search by name, email, specialty..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-8 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/20 w-72 transition-all font-medium shadow-sm"
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
                        <button
                            onClick={() => {
                                setStaffToEdit(null)
                                setIsModalOpen(true)
                            }}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add New Staff</span>
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
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-[200px]">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Specialization</label>
                            <select
                                value={specialty}
                                onChange={e => { setSpecialty(e.target.value); setPage(1) }}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 transition-all"
                            >
                                <option value="">All Specializations</option>
                                {SPECIALTY_OPTIONS.map(sp => (
                                    <option key={sp} value={sp}>{sp}</option>
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

                {/* Table Container */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b border-gray-50">
                                    <th className="px-8 py-5">Personnel Profile</th>
                                    <th className="px-8 py-5">Specialization</th>
                                    <th className="px-8 py-5">Consult Fee</th>
                                    <th className="px-8 py-5">Access Status</th>
                                    <th className="px-8 py-5 text-right">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-10 bg-white"></td>
                                        </tr>
                                    ))
                                ) : staff.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                                    <Search className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-400 font-medium">No staff members found matching your criteria</p>
                                                {(activeFilterCount > 0 || search) && (
                                                    <button onClick={clearFilters} className="text-teal-600 font-bold text-sm hover:underline">
                                                        Clear filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : staff.map((member: any) => {
                                    const { badge, dot } = statusBadge(member.user.status)
                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center font-bold text-teal-600 uppercase text-xs">
                                                        {member.firstName[0]}{member.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                                                            Dr. {member.firstName} {member.lastName}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">ID: #PHY-{member.id.substring(0,3)}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                            <span className="text-xs text-gray-400 font-medium">{member.user.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-gray-900">{member.specialty}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-gray-900">₹{member.consultationFee.toFixed(2)}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    {member.user.status === 'INACTIVE' ? (
                                                        <>
                                                            <div className="w-9 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center px-1 opacity-50 cursor-not-allowed">
                                                                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                                            </div>
                                                            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-tight bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                                                Setup Pending
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    const actionText = member.user.status === 'ACTIVE' ? 'suspend' : 'activate'
                                                                    setConfirmModalConfig({
                                                                        isOpen: true,
                                                                        title: `${actionText === 'suspend' ? 'Suspend' : 'Activate'} Staff Member`,
                                                                        message: `Are you sure you want to ${actionText} this staff member? Their access will immediately be updated.`,
                                                                        actionText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
                                                                        isDestructive: actionText === 'suspend',
                                                                        onConfirm: () => {
                                                                            setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))
                                                                            handleToggleStatus(member.user.id, member.user.status)
                                                                        }
                                                                    })
                                                                }}
                                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${member.user.status === 'ACTIVE' ? 'bg-teal-500' : 'bg-gray-200'}`}
                                                            >
                                                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${member.user.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'}`} />
                                                            </button>
                                                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                                                                {member.user.status === 'ACTIVE' ? 'Active' : (member.user.status === 'BLOCKED' || member.user.status === 'SUSPENDED') ? 'Suspended' : member.user.status}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(member)}
                                                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmModalConfig({
                                                                isOpen: true,
                                                                title: "Remove Staff Member",
                                                                message: "Are you sure you want to permanently remove this staff member? This action cannot be undone.",
                                                                actionText: "Remove Staff",
                                                                isDestructive: true,
                                                                onConfirm: () => {
                                                                    setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))
                                                                    handleDelete(member.user.id)
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
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <p className="text-xs text-gray-500 font-medium">
                            Showing <span className="text-gray-900 font-bold">{Math.min((page - 1) * 10 + 1, totalActive)}-{Math.min(page * 10, totalActive)}</span> of <span className="text-gray-900 font-bold">{totalActive}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-teal-500 hover:border-teal-100 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-white transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' : 'text-gray-400 hover:bg-white hover:text-gray-600'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-teal-500 hover:border-teal-100 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-white transition-all shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <AddStaffModal
                isOpen={isModalOpen}
                staffToEdit={staffToEdit}
                onClose={() => {
                    setIsModalOpen(false)
                    setStaffToEdit(null)
                }}
                onSuccess={() => {
                    fetchStaff()
                    setIsModalOpen(false)
                    setStaffToEdit(null)
                }}
            />

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
