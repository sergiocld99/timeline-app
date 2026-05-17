import type { ButtonProps } from "@/types/props";

import { CirclePlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const AddAction = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={t("add")}
    >
      <CirclePlus className="h-4 w-4" />
    </Button>
  )
}

export default AddAction