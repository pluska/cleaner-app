"use client";

import Link from "next/link";
import { Home, Calendar, Sparkles, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
    },
    {
      label: "Schedule",
      href: "/schedule",
      icon: Calendar,
    },
    {
      label: "Store",
      href: "/store",
      icon: Sparkles,
    },
    {
      label: "Stats",
      href: "/stats",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
      <nav className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 border border-gray-100">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-3 rounded-full transition-all duration-300 ${
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-gray-400 hover:text-primary hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="text-sm font-semibold">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
