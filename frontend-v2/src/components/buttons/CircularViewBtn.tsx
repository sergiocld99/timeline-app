import type { ButtonProps } from "@/types/props";

import { PieChart } from "lucide-react";

import { Button } from "../ui/button";

const CircularViewBtn = ({ handleClick, isActive }: ButtonProps) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      onClick={handleClick}
      aria-label="Circular stats"
    >
      <PieChart className="h-4 w-4" />
    </Button>
  )
}

export default CircularViewBtn;