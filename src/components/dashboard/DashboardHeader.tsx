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
    <div className="flex items-start justify-between gap-4 mb-6 relative">
      <div>
        <div className="text-muted text-xs font-medium tracking-wide mb-2">
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
