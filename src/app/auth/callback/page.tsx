"use client";

import { AuthCallback } from "@/components/auth/AuthCallback";

import { Suspense } from "react";

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallback />
    </Suspense>
  );
}
