import { MoveLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

const BackAction = () => {
  const t = useTranslations("Actions");
  return (
    <Button
      size="lg"
      variant="outline"
      title={t("goBack")}
    >
      <MoveLeftIcon className="h-4 w-4" />
    </Button>
  )
}

export default BackAction
