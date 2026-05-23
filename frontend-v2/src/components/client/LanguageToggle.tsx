"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "@/i18n/routing";

const LanguageToggle = () => {
  const t = useTranslations("Languages");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (nextLocale: "en" | "es") => {
    if (nextLocale === locale) return;

    startTransition(() => {
      // Safely access window.location.search to preserve query parameters (like date filters)
      const search = typeof window !== "undefined" ? window.location.search : "";
      const fullPath = search ? `${pathname}${search}` : pathname;
      router.replace(fullPath, { locale: nextLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isPending} aria-label={t("toggleLanguage")}>
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("toggleLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          className={locale === "en" ? "font-bold bg-accent" : ""}
        >
          {t("en")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("es")}
          className={locale === "es" ? "font-bold bg-accent" : ""}
        >
          {t("es")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
