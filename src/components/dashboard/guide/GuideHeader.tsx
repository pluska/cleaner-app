import { BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

export function GuideHeader() {
  const { language } = useLanguage();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("User Guide", language)}
              </h1>
              <p className="text-gray-600">
                {t("Learn how to use SparkClean effectively", language)}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-500">SparkClean</span>
          </div>
        </div>
      </div>
    </div>
  );
}
