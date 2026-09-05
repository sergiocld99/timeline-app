import type { ButtonProps } from "@/types/props"

import { Check, Copy } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

type CopyButtonProps = ButtonProps & {
  copied: boolean
}

const CopyButton = ({ handleClick, copied }: CopyButtonProps) => {
  const t = useTranslations("Actions");
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={copied ? t("copiedCoordinates") : t("copyCoordinates")}
      className="h-6 w-6 p-0 mx-3"
    >
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}

export default CopyButton
