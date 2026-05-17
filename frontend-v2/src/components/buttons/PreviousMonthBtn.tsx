import type { ButtonProps } from "@/types/props";

import { RewindIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const PreviousMonthBtn = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button aria-label={t("previousMonth")} title={t("previousMonth")} type="button" variant="outline" onClick={handleClick}>
      <RewindIcon className="h-4 w-4" />
    </Button>
  )
}

export default PreviousMonthBtn
