import type { ButtonProps } from "@/types/props";

import { CalendarRange, Repeat } from "lucide-react";

import { Button } from "../ui/button";

const CalendarModeBtn = ({ handleClick, isActive }: ButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Toggle calendar mode"
      aria-pressed={isActive}
    >
      {isActive ? <CalendarRange className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
    </Button>
  )
}

export default CalendarModeBtn;
