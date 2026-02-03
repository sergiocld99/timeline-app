import type { ButtonProps } from "@/types/props";

import { BarChart2 } from "lucide-react";

import { Button } from "../ui/button";

const BarViewBtn = ({ handleClick, isActive }: ButtonProps) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      onClick={handleClick}
      aria-label="Bar stats"
    >
      <BarChart2 className="h-4 w-4" />
    </Button>
  )
}

export default BarViewBtn;