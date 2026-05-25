import type { ButtonProps } from "@/types/props";

import { FastForwardIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const NextMonthBtn = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button aria-label={t("nextMonth")} title={t("nextMonth")} type="button" variant="outline" onClick={handleClick}>
      <FastForwardIcon className="h-4 w-4" />
    </Button>
  )
}

export default NextMonthBtn
