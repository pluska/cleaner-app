"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Home, Calendar, ShoppingBag, Crown } from "lucide-react";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const labels: Record<string,string> = {Home:"Inicio",Schedule:"Agenda",Store:"Tienda",Kingdom:"Reino"};

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
      icon: ShoppingBag,
    },
    {
      label: "Kingdom",
      href: "/kingdom",
      icon: Crown,
    },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
      <nav aria-label={language === "es" ? "Navegación principal" : "Main navigation"} className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 border border-gray-100">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const label = language === "es" ? labels[item.label] : item.label;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center space-x-2 px-4 py-3 rounded-full transition-all duration-300 ${
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-gray-400 hover:text-primary hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="text-sm font-semibold">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
