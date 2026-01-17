import type { ButtonProps } from "@/types/props";

import { CircleMinus } from "lucide-react";

import { Button } from "@/components/ui/button";

const BUTTON_TITLE = "Remove"

const MinusAction = ({ handleClick }: ButtonProps) => {
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={BUTTON_TITLE}
    >
      <CircleMinus className="h-4 w-4" />
    </Button>
  )
}

export default MinusAction