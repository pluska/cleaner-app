"use client";

import { Trophy, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const { language } = useLanguage();

  return (
    <Card className="mt-20 text-center p-12 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
      <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Trophy className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-dark mb-4">
        {t("Ready to Transform Your Home?", language)}
      </h2>
      <p className="text-dark/70 mb-8 max-w-2xl mx-auto">
        {t(
          "Join thousands of users who have already simplified their cleaning routine and created more organized, beautiful homes.",
          language
        )}
      </p>
      <Button
        onClick={onGetStarted}
        variant="primary"
        size="lg"
        className="group"
      >
        <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
        {t("Create Your Free Account", language)}
      </Button>
    </Card>
  );
}
