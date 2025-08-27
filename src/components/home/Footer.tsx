"use client";

import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-secondary" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
          <span className="text-xl font-bold">SparkClean</span>
        </div>
        <p className="text-dark/40">© 2024 SparkClean. All rights reserved.</p>
      </div>
    </footer>
  );
}
