import { Palette, Baseline } from "lucide-react"

export default function BrandingSettings() {
    return (
        <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section Header */}
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
                    <Palette className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">Branding</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px] mt-1">Customize colors and appearance of the patient portal</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* Color Pickers */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Color</label>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#0D9488] rounded-2xl shadow-lg shadow-teal-100 border-2 border-white" />
                            <div className="flex-1 relative group">
                                <input 
                                    type="text" 
                                    defaultValue="#0D9488"
                                    className="w-full pl-6 pr-4 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-black text-gray-900 text-sm uppercase tracking-widest"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest group-focus-within:text-primary-600 transition-colors">HEX/RGB</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Accent Color</label>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#6366F1] rounded-2xl shadow-lg shadow-indigo-100 border-2 border-white" />
                            <div className="flex-1 relative group">
                                <input 
                                    type="text" 
                                    defaultValue="#6366F1"
                                    className="w-full pl-6 pr-4 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-black text-gray-900 text-sm uppercase tracking-widest"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest group-focus-within:text-primary-600 transition-colors">HEX/RGB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography & Theme */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Font Family</label>
                        <div className="relative">
                            <select className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm appearance-none">
                                <option>Inter (Default)</option>
                                <option>Outfit</option>
                                <option>Roboto</option>
                                <option>System UI</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Baseline className="w-4 h-4 text-gray-300" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Portal Theme</label>
                        <select className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm appearance-none">
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System Sync</option>
                        </select>
                    </div>
                </div>

                {/* Tagline */}
                <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Patient Portal Tagline</label>
                    <textarea 
                        rows={2}
                        defaultValue="Your health, our priority — accessible anywhere."
                        className="w-full px-6 py-5 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30 transition-all outline-none font-bold text-gray-900 text-sm resize-none"
                        placeholder="Enter a welcoming tagline for your patients..."
                    />
                </div>

                {/* Preview Cards */}
                <div className="pt-6 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Live Preview</h4>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest">Real-time sync active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Login Page Preview</span>
                        </div>
                        <div className="h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Dashboard Preview</span>
                        </div>
                    </div>
                </div>

                {/* Submit Section */}
                <div className="pt-6 flex justify-end">
                    <button className="px-10 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-100 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95 text-sm uppercase tracking-widest">
                        Apply Brand Logic
                    </button>
                </div>
            </div>
        </div>
    )
}
