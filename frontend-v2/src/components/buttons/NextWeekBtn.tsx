import type { ButtonProps } from "@/types/props";

import { PlayIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const NextWeekBtn = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button aria-label={t("nextWeek")} title={t("nextWeek")} type="button" variant="outline" onClick={handleClick}>
      <PlayIcon className="h-4 w-4" />
    </Button>
  )
}

export default NextWeekBtn
