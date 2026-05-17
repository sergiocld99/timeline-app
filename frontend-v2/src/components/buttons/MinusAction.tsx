import type { ButtonProps } from "@/types/props";

import { CircleMinus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const MinusAction = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={t("remove")}
    >
      <CircleMinus className="h-4 w-4" />
    </Button>
  )
}

export default MinusAction