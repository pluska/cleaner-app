import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { SettingsMenu } from "@/components/ui/layout/SettingsMenu";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { language } = useLanguage();
  const currentDate = new Date();
  
  const formattedDate = currentDate
    .toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <div className="flex items-center justify-between mb-6 relative">
      <div>
        <div className="text-gray-400 text-[10px] font-bold tracking-[0.15em] mb-1">
          {formattedDate}
        </div>
        <h1 className="text-2xl font-bold text-dark">
          {t("Ready for your quest?", language)} <span className="font-extrabold">{userName}</span>!
        </h1>
      </div>

      <SettingsMenu />
    </div>
  );
}
