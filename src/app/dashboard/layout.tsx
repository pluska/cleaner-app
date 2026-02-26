"use client";

import { BottomNav } from "@/components/ui/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* 
        The pb-24 ensures content doesn't get hidden behind the floating BottomNav.
        The background color #F8F9FA matches the very light grey/off-white of the mockup.
      */}
      {children}
      <BottomNav />
    </div>
  );
}
