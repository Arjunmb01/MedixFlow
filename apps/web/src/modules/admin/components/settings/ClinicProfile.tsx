import { Upload, Building2 } from "lucide-react"

export default function ClinicProfile() {
    return (
        <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section Header */}
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">Clinic Profile</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px] mt-1">Public-facing information about your clinic</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* Logo Section */}
                <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Clinic Logo</label>
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-primary-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-primary-100">
                            M
                        </div>
                        <div className="space-y-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-50 rounded-xl font-bold text-gray-700 hover:border-primary-600/20 hover:bg-primary-50/30 transition-all active:scale-95 group">
                                <Upload className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                                <span className="text-sm">Upload Logo</span>
                            </button>
                            <p className="text-[11px] text-gray-400 font-medium">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                        </div>
                    </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Clinic Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            defaultValue="MedixFlow City Clinic"
                            maxLength={30}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Registration Number</label>
                        <input 
                            type="text" 
                            defaultValue="MED-2024-001892"
                            maxLength={20}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Clinic Type <span className="text-red-500">*</span></label>
                        <select className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm appearance-none">
                            <option>Multi-Specialty Clinic</option>
                            <option>General Practice</option>
                            <option>Specialized Care</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                        <input 
                            type="text" 
                            defaultValue="+1 (555) 012-3456"
                            maxLength={15}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address <span className="text-red-500">*</span></label>
                        <input 
                            type="email" 
                            defaultValue="admin@medixflow.clinic"
                            maxLength={30}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Website</label>
                        <input 
                            type="text" 
                            defaultValue="https://medixflow.clinic"
                            maxLength={255}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm"
                        />
                    </div>
                    <div className="col-span-2 space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Clinic Address</label>
                        <textarea 
                            rows={3}
                            defaultValue="12 Healthcare Avenue, Medical District, New York, NY 10001, USA"
                            maxLength={255}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                        <input 
                            type="text" 
                            defaultValue="New York"
                            maxLength={30}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Timezone</label>
                        <select className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm appearance-none">
                            <option>America/New_York (UTC-5)</option>
                            <option>London/Europe (UTC+0)</option>
                            <option>Asia/Kolkata (UTC+5:30)</option>
                        </select>
                    </div>
                </div>

                {/* Submit Section */}
                <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <button className="px-10 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-100 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95 text-sm uppercase tracking-widest">
                        Save Configurations
                    </button>
                </div>
            </div>
        </div>
    )
}
