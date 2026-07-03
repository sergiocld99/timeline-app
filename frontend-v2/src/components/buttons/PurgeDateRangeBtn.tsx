import type { ButtonProps } from "@/types/props";

import { useTranslations } from "next-intl";
import { Eraser } from "lucide-react";

import { Button } from "@/components/ui/button";

const PurgeDateRangeBtn = ({ handleClick }: ButtonProps) => {
  const t = useTranslations("DateRange");

  return (
    <Button
      type="button"
      onClick={handleClick}
      variant="outline"
      className="gap-2"
    >
      <Eraser className="h-4 w-4" />
      {t("purge")}
    </Button>
  );
};

export default PurgeDateRangeBtn;
