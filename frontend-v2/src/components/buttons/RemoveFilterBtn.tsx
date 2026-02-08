import type { ButtonProps } from "@/types/props"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = ButtonProps & {
  filterName: string
}

const RemoveFilterBtn = ({ handleClick, filterName }: Props) => {
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <X className="h-4 w-4" />
      Remove Filter: {filterName}
    </Button>
  )
}

export default RemoveFilterBtn
