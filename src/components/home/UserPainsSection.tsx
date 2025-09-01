"use client";

import { AlertCircle, Target, Users, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Card } from "@/components/ui/layout/Card";

export function UserPainsSection() {
  const { language } = useLanguage();

  const pains = [
    {
      icon: AlertCircle,
      title: t("Want to Clean", language),
      pain: t(
        "I know I need to clean, but I don't know where to start or what really matters.",
        language
      ),
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      icon: Target,
      title: t("Begin to Clean", language),
      pain: t(
        "I start cleaning, but it feels endless and I lose motivation fast.",
        language
      ),
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      icon: Users,
      title: t("Get Overwhelmed or Bored", language),
      pain: t(
        "Tasks pile up, others don't help, and I end up frustrated or giving up.",
        language
      ),
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  return (
    <div className="mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-dark mb-4">
          {t("Make cleaning could be exhausting", language)}
        </h2>
        <p className="text-dark/70 max-w-2xl mx-auto">
          {t(
            "1 in 6 people admit they go over a month without cleaning.",
            language
          )}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {pains.map((pain, index) => (
          <Card
            key={index}
            className={`p-6 hover:shadow-lg transition-all duration-300 group ${pain.bgColor} ${pain.borderColor} border-2`}
            style={{
              backgroundColor:
                pain.bgColor === "bg-yellow-50"
                  ? "#fefce8"
                  : pain.bgColor === "bg-blue-50"
                  ? "#eff6ff"
                  : "#f0fdf4",
            }}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`bg-gradient-to-br ${pain.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}
              >
                <pain.icon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-dark mb-2">
                  {pain.title}
                </h3>

                <div className="mb-4 p-3 bg-white/60 rounded-xl border border-gray-200">
                  <p className="text-dark/70 text-sm leading-relaxed">
                    "{pain.pain}"
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
