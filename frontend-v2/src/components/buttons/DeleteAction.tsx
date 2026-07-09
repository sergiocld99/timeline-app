import type { ButtonProps } from "@/types/props";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const DeleteAction = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={t("delete")}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

export default DeleteAction