import { Coins, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

interface StatsOverviewProps {
  statusPercentage: number;
  streakCount: number;
}

export function StatsOverview({
  statusPercentage,
  streakCount,
}: StatsOverviewProps) {
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {/* Coins Card (formerly Status) */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[100px]">
        <div className="flex items-center space-x-1.5 mb-1">
          <Coins className="w-[14px] h-[14px] text-yellow-500" />
          <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
            {t("Coins", language)}
          </span>
        </div>
        <div className="text-4xl font-extrabold text-dark tracking-tight">
          {statusPercentage}
        </div>
      </div>

      {/* Level Card (formerly Streak) */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[100px]">
        <div className="flex items-center space-x-1.5 mb-1">
          <Star className="w-[14px] h-[14px] text-blue-500" />
          <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
            {t("Level", language)}
          </span>
        </div>
        <div className="text-4xl font-extrabold text-dark tracking-tight">
          {streakCount}
        </div>
      </div>
    </div>
  );
}
