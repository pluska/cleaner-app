"use client";

import { UserGuide } from "@/components/dashboard/guide/UserGuide";
import { GuideHeader } from "@/components/dashboard/guide/GuideHeader";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GuideHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserGuide />
      </div>
    </div>
  );
}
