"use client";

import { Trophy, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const { language } = useLanguage();

  return (
    <Card className="mt-20 text-center p-12 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
      <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Trophy className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-text mb-4">
        {language === "es"
          ? "¿Listo para Transformar tu Hogar?"
          : "Ready to Transform Your Home?"}
      </h2>
      <p className="text-text/70 mb-8 max-w-2xl mx-auto">
        {language === "es"
          ? "Únete a miles de usuarios que ya han simplificado su rutina de limpieza y creado hogares más organizados y hermosos."
          : "Join thousands of users who have already simplified their cleaning routine and created more organized, beautiful homes."}
      </p>
      <Button
        onClick={onGetStarted}
        variant="primary"
        size="lg"
        className="group"
      >
        <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
        {language === "es"
          ? "Crear Cuenta Gratuita"
          : "Create Your Free Account"}
      </Button>
    </Card>
  );
}
