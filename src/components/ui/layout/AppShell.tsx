"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, Crown, ShoppingBag, Users } from 'lucide-react';
import { HouseholdProvider } from '@/contexts/HouseholdContext';
import { HouseholdSwitcher } from '@/components/households/HouseholdSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { BrandLogo } from './BrandLogo';
import { BottomNav } from './BottomNav';

// Only live, data-backed routes are exposed.
const appNavigation = [
  { en: 'Home', es: 'Inicio', href: '/dashboard', icon: Home },
  { en: 'Schedule', es: 'Agenda', href: '/schedule', icon: CalendarDays },
  { en: 'Kingdom', es: 'Reino', href: '/kingdom', icon: Crown },
  { en: 'Camaradas', es: 'Camaradas', href: '/households', icon: Users },
  { en: 'Store', es: 'Tienda', href: '/store', icon: ShoppingBag },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return <HouseholdProvider><ShellContent>{children}</ShellContent></HouseholdProvider>;
}

function ShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <BrandLogo href="/dashboard" priority />
        <HouseholdSwitcher />
        <nav aria-label={language === 'es' ? 'Navegación principal' : 'Main navigation'}>
          {appNavigation.map(({ href, icon: Icon, ...labels }) => (
            <Link key={href} href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}>
              <Icon size={24} aria-hidden="true" /><span>{labels[language]}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="app-mobile-brand"><BrandLogo href="/dashboard" priority /><HouseholdSwitcher /></div>
      <main className="app-content">{children}</main>
      <BottomNav />
    </div>
  );
}
