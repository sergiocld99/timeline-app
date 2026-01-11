import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/types/props"

const RemoveFilterBtn = ({ handleClick }: ButtonProps) => {
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <X className="h-4 w-4" />
      Remove Filter
    </Button>
  )
}

export default RemoveFilterBtn
