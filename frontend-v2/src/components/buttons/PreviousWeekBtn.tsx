import type { ButtonProps } from "@/types/props";

import { PlayIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const PreviousWeekBtn = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button aria-label={t("previousWeek")} title={t("previousWeek")} type="button" variant="outline" onClick={handleClick}>
      <PlayIcon className="h-4 w-4 rotate-180" />
    </Button>
  )
}

export default PreviousWeekBtn
