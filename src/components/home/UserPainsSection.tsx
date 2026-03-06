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
      title: t("Lack of Motivation", language),
      pain: t(
        "I know I need to clean, but I just can't get started. It feels like a chore, not something I want to do.",
        language
      ),
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      icon: Target,
      title: t("Overwhelmed by Mess", language),
      pain: t(
        "The mess is too big. I don't know where to begin, so I end up doing nothing at all.",
        language
      ),
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      icon: Users,
      title: t("Can't Stay Consistent", language),
      pain: t(
        "I clean once in a while, but then I stop. I wish I could build a habit that actually sticks.",
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
          {t("Why is cleaning so hard?", language)}
        </h2>
        <p className="text-dark/70 max-w-2xl mx-auto">
          {t(
            "It's not you. It's the boring, endless nature of chores. We fixed that.",
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
