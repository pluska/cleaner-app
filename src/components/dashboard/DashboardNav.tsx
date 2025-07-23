"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Home,
  Calendar,
  BarChart3,
  LogOut,
  User,
  List,
} from "lucide-react";
import { createClient } from "@/libs/supabase";
import { useRouter } from "next/navigation";
import { User as UserType } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

interface DashboardNavProps {
  user: UserType;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { language } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/dashboard", label: t("Today", language), icon: Home },
    {
      href: "/dashboard/schedule",
      label: t("Schedule", language),
      icon: Calendar,
    },
    {
      href: "/dashboard/all-tasks",
      label: t("All Tasks", language),
      icon: List,
    },
    {
      href: "/dashboard/analytics",
      label: t("Analytics", language),
      icon: BarChart3,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                {t("CleanPlanner", language)}
              </span>
            </div>

            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">{t("Sign Out", language)}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
