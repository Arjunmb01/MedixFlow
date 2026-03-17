import Card from "@/modules/patient/components/ui/Card"

export default function BillingSummary() {
    return (
        <Card className="border-none shadow-sm rounded-[2rem] p-8 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-[16px] font-bold text-gray-900 mb-6 tracking-tight">Billing Summary</h3>
                
                <div className="mt-4">
                    <p className="text-[32px] font-bold text-gray-900">₹0.00</p>
                    <p className="text-[13px] font-medium text-gray-400 mt-1">Pending Amount</p>
                </div>
            </div>

            <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center py-4 border-t border-gray-100">
                    <span className="text-[13px] font-medium text-gray-400">Last Payment</span>
                    <span className="text-[14px] font-bold text-gray-900">₹150.00 on Oct 12</span>
                </div>

                <button className="w-full py-3 rounded-2xl border-2 border-blue-600 text-blue-600 font-bold text-[14px] hover:bg-blue-600 hover:text-white transition-all">
                    View Details & Payments
                </button>
            </div>
        </Card>
    )
}
