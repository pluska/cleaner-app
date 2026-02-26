import { BottomNav } from "@/components/ui/layout/BottomNav";

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
