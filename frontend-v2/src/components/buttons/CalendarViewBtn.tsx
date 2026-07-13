import type { ButtonProps } from "@/types/props";

import { CalendarDays } from "lucide-react";

import { Button } from "../ui/button";

const CalendarViewBtn = ({ handleClick, isActive }: ButtonProps) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      onClick={handleClick}
      aria-label="Calendar stats"
    >
      <CalendarDays className="h-4 w-4" />
    </Button>
  )
}

export default CalendarViewBtn;
