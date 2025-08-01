"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sparkles,
  LogOut,
  User,
  List,
  BrushCleaning,
  BookOpen,
  Coins,
  Gem,
} from "lucide-react";
import { createClient } from "@/libs/supabase";
import { useRouter } from "next/navigation";
import { UserProfile, User as UserType } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { LanguageSwitcher } from "@/components/ui/layout/LanguageSwitcher";

interface DashboardNavProps {
  user: UserType;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(
    undefined
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("No session token available");
        return;
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const { profile: fetchedProfile } = await response.json();
        setUserProfile(fetchedProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/dashboard", label: t("Routine", language), icon: BrushCleaning },
    {
      href: "/dashboard/all-tasks",
      label: t("All Tasks", language),
      icon: List,
    },
    {
      href: "/dashboard/guide",
      label: t("User Guide", language),
      icon: BookOpen,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">
                {t("CleanPlanner", language)}
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="px-2 pt-2 pb-3 border-t border-gray-200">
              <div className="flex items-center justify-between px-3 py-2">
                <LanguageSwitcher />
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden sm:flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                {t("CleanPlanner", language)}
              </span>
            </div>

            <div className="ml-10 flex items-baseline space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-100 text-blue-700 shadow-md px-4 py-2"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md w-12 h-12"
                    }`}
                  >
                    <Icon className="h-5 w-5" />

                    {/* Active Label */}
                    {isActive && (
                      <span className="ml-2 font-medium">{item.label}</span>
                    )}

                    {/* Hover Label for Inactive Items */}
                    {!isActive && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.label}
                        {/* Arrow */}
                        <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-0 border-r-4 border-t-4 border-b-4 border-transparent border-r-gray-900"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="flex items-center space-x-3 text-sm">
              {isLoadingProfile ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="hidden lg:inline">Loading...</span>
                </div>
              ) : userProfile ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Link href="/dashboard/profile">
                      <User className="h-4 w-4 text-blue-600" />
                    </Link>
                    <span className="font-medium text-gray-900">
                      {userProfile.display_name ||
                        userProfile.username ||
                        "Hero"}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      Lv.{userProfile.level}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-500 hidden lg:flex">
                    <div className="flex items-center space-x-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {userProfile.coins}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Gem className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">
                        {userProfile.gems}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">{user.email}</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm hidden lg:inline">
                  {t("Sign Out", language)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
