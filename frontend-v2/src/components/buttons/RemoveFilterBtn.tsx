import type { ButtonProps } from "@/types/props"

import { useTranslations } from "next-intl"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = ButtonProps & {
  filterName: string
}

const RemoveFilterBtn = ({ handleClick, filterName }: Props) => {
  const t = useTranslations("Actions");

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <X className="h-4 w-4" />
      {t("removeFilter", { filterName })}
    </Button>
  )
}

export default RemoveFilterBtn
