import KingdomCanvas from "@/components/kingdom/KingdomCanvas";
import { BottomNav } from "@/components/ui/layout/BottomNav";

export default function KingdomPage() {
  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header Area */}
      <div className="pt-12 md:pt-16 px-6 md:px-8 max-w-md md:max-w-xl lg:max-w-2xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Kingdom</h1>
        <p className="text-gray-500">Arrange your earned items and build your space.</p>
      </div>

      {/* Canvas Area */}
      <div className="px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <KingdomCanvas />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
