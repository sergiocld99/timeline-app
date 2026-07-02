import type { ButtonProps } from "@/types/props";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = ButtonProps & {
  isGold?: boolean;
}

const ApplyButton = ({ handleClick, disabled, isGold = false }: Props) => {
  const t = useTranslations("Actions");
  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn("bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed", isGold && "bg-amber-600 hover:bg-amber-700")}
    >
      <Check className="h-4 w-4 mr-2" />
      {t("apply")}
    </Button>
  )
}

export default ApplyButton
