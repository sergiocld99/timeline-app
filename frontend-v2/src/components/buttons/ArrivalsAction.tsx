import { PlaneLandingIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type Props = {
  size: "sm" | "lg"
}

const ArrivalsAction = ({ size }: Props) => {
  const t = useTranslations("Actions");
  return (
    <Button
      size={size}
      variant="outline"
      title={t("arrivals")}
    >
      <PlaneLandingIcon className="h-4 w-4" />
    </Button>
  )
}

export default ArrivalsAction