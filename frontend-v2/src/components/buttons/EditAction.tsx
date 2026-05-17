import type { ButtonProps } from "@/types/props";

import { Edit3 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const EditAction = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={t("edit")}
    >
      <Edit3 className="h-4 w-4" />
    </Button>
  )
}

export default EditAction