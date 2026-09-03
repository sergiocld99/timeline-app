import type { ButtonProps } from "@/types/props"

import { Play } from "lucide-react"

import { Button } from "@/components/ui/button"

const AnimateTimelineBtn = ({ handleClick, isActive }: ButtonProps) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      onClick={handleClick}
      aria-label="Animate timeline"
    >
      <Play className="h-4 w-4" />
    </Button>
  )
}

export default AnimateTimelineBtn
