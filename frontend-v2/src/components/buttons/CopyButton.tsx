import type { ButtonProps } from "@/types/props"

import { Copy } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

const CopyButton = ({handleClick}: ButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={t("copyCoordinates")}
      className="h-6 w-6 p-0 mx-3"
    >
      <Copy className="h-3 w-3" />
    </Button>
  )
}

export default CopyButton
