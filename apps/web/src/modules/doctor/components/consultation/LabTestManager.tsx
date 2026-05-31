import React, { useState } from "react";
import { FlaskConical, Loader2, ExternalLink, FileText, CheckCircle2, AlertTriangle, Search, Plus, MessageSquare } from "lucide-react";

interface LabReport {
    id: string;
    fileUrl: string;
    fileName: string;
    uploadedAt: Date;
}

interface LabTest {
    id: string;
    testName: string;
    status: 'PENDING' | 'UPLOADED' | 'REVIEWED';
    urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
    reports?: LabReport[];
    fastingRequired: boolean;
    isAbnormal: boolean;
    reviewerComments?: string;
    createdAt: string;
}

interface LabTestManagerProps {
    labTests: LabTest[];
    onRequest: (testName: string, urgency: string, fastingRequired: boolean) => Promise<void>;
    onReview?: (labTestId: string, comments: string, isAbnormal: boolean) => Promise<void>;
    disabled?: boolean;
}

export const LabTestManager: React.FC<LabTestManagerProps> = ({ labTests, onRequest, onReview, disabled }) => {
    const [testName, setTestName] = useState("");
    const [urgency, setUrgency] = useState("NORMAL");
    const [fastingRequired, setFastingRequired] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Review states
    const [selectedReviewTest, setSelectedReviewTest] = useState<LabTest | null>(null);
    const [reviewerComments, setReviewerComments] = useState("");
    const [isAbnormal, setIsAbnormal] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);

    const handleRequest = async () => {
        if (!testName.trim()) return;
        setIsSubmitting(true);
        try {
            await onRequest(testName.trim(), urgency, fastingRequired);
            setTestName("");
            setUrgency("NORMAL");
            setFastingRequired(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!selectedReviewTest || !onReview) return;
        setIsReviewing(true);
        try {
            await onReview(selectedReviewTest.id, reviewerComments, isAbnormal);
            setSelectedReviewTest(null);
            setReviewerComments("");
            setIsAbnormal(false);
        } finally {
            setIsReviewing(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl shadow-orange-50/50 mb-8 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/30 rounded-full -mr-32 -mt-32 blur-3xl -z-10"></div>
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                        <FlaskConical className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Clinical Diagnostics</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Lab Test Lifecycle</p>
                    </div>
                </div>
            </div>

            {!disabled && (
                <div className="bg-orange-50/30 rounded-3xl p-8 border border-orange-100 mb-10">
                    <div className="grid grid-cols-12 gap-6 items-end">
                        <div className="col-span-5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Test Name</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                                <input 
                                    type="text" placeholder="Search pathology tests..."
                                    value={testName} 
                                    onChange={(e) => setTestName(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="col-span-3">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Urgency</label>
                            <select 
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-700 outline-none focus:border-orange-500 transition-all shadow-sm cursor-pointer"
                            >
                                <option value="NORMAL">Normal</option>
                                <option value="URGENT">Urgent</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Preparation</label>
                            <button
                                onClick={() => setFastingRequired(!fastingRequired)}
                                className={`w-full py-4 rounded-2xl text-[10px] font-black transition-all border ${
                                    fastingRequired 
                                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-orange-200'
                                }`}
                            >
                                FASTING REQ.
                            </button>
                        </div>

                        <div className="col-span-2">
                            <button 
                                onClick={handleRequest}
                                disabled={isSubmitting || !testName.trim()}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {labTests.length > 0 ? (
                <div className="space-y-4">
                    {labTests.map((test) => (
                        <div key={test.id} className="group p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl hover:shadow-orange-50/50 transition-all animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                        test.urgency === 'EMERGENCY' ? 'bg-red-50' : 
                                        test.urgency === 'URGENT' ? 'bg-orange-50' : 'bg-blue-50'
                                    }`}>
                                        <FlaskConical className={`w-6 h-6 ${
                                            test.urgency === 'EMERGENCY' ? 'text-red-600' : 
                                            test.urgency === 'URGENT' ? 'text-orange-600' : 'text-blue-600'
                                        }`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-black text-gray-900 text-lg leading-tight">{test.testName}</h4>
                                            <div className="flex gap-1.5">
                                                {test.urgency !== 'NORMAL' && (
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                                                        test.urgency === 'EMERGENCY' ? 'bg-red-600 text-white shadow-sm' : 'bg-orange-500 text-white shadow-sm'
                                                    }`}>
                                                        {test.urgency}
                                                    </span>
                                                )}
                                                {test.fastingRequired && (
                                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter bg-amber-100 text-amber-700 border border-amber-200">
                                                        Fasting Required
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Ordered: {new Date(test.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {test.isAbnormal && (
                                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl animate-pulse">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Abnormal Result</span>
                                        </div>
                                    )}
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                                        test.status === 'REVIEWED' ? 'bg-green-50 border-green-100 text-green-700' :
                                        test.status === 'UPLOADED' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                                        'bg-gray-50 border-gray-100 text-gray-400'
                                    }`}>
                                        {test.status === 'REVIEWED' ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className={`w-4 h-4 ${test.status === 'PENDING' ? 'animate-spin' : ''}`} />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">{test.status}</span>
                                    </div>

                                    {test.status === 'UPLOADED' && onReview && (
                                        <button 
                                            onClick={() => setSelectedReviewTest(test)}
                                            className="px-6 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                                        >
                                            Review Result
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Reports List */}
                            {test.reports && test.reports.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-3 pl-20">
                                    {test.reports.map((report) => (
                                        <a 
                                            key={report.id}
                                            href={report.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-2xl hover:border-orange-200 hover:shadow-lg transition-all group/report"
                                        >
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover/report:bg-orange-50 transition-colors">
                                                <FileText className="w-5 h-5 text-gray-400 group-hover/report:text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-700 truncate max-w-[120px]">{report.fileName || "Diagnostic Report"}</p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(report.uploadedAt).toLocaleDateString()}</p>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover/report:text-orange-400" />
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Reviewer Comments */}
                            {test.status === 'REVIEWED' && test.reviewerComments && (
                                <div className="mt-4 ml-20 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3">
                                    <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Doctor's Review Comments</p>
                                        <p className="text-sm font-medium text-gray-700">{test.reviewerComments}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FlaskConical className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-black text-gray-300 uppercase tracking-widest">No Diagnostics Pending</h3>
                    <p className="text-gray-400 text-sm mt-2">Laboratory requests will appear here after formulation.</p>
                </div>
            )}

            {/* Review Modal */}
            {selectedReviewTest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedReviewTest(null)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                                    <FlaskConical className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Review Lab Result</h3>
                                    <p className="text-gray-500 font-bold">{selectedReviewTest.testName}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Reviewer Comments</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Enter your clinical observations or instructions based on the report..."
                                        value={reviewerComments}
                                        onChange={(e) => setReviewerComments(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-700 focus:bg-white focus:border-orange-500 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                    <div>
                                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Abnormal Findings?</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">Marks the test as abnormal in patient records</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsAbnormal(!isAbnormal)}
                                        className={`w-14 h-8 rounded-full transition-all relative ${isAbnormal ? 'bg-red-500 shadow-lg shadow-red-100' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${isAbnormal ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button 
                                    onClick={() => setSelectedReviewTest(null)}
                                    className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                                >
                                    Dismiss
                                </button>
                                <button 
                                    onClick={handleReviewSubmit}
                                    disabled={isReviewing}
                                    className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2"
                                >
                                    {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
