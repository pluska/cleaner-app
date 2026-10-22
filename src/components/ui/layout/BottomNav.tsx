"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Home, Calendar, ShoppingBag, Crown, Users } from "lucide-react";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const labels: Record<string,string> = {Home:"Inicio",Schedule:"Agenda",Store:"Tienda",Kingdom:"Reino",Camaradas:"Camaradas"};

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
    { label: "Kingdom", href: "/kingdom", icon: Crown },
    { label: "Camaradas", href: "/households", icon: Users },
    { label: "Store", href: "/store", icon: ShoppingBag },
  ];

  return (
    <nav aria-label={language === "es" ? "Navegación principal" : "Main navigation"} className="app-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const label = language === "es" ? labels[item.label] : item.label;
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} aria-label={label} aria-current={isActive ? "page" : undefined}>
            <Icon aria-hidden="true" strokeWidth={2} /><span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
