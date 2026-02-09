import type { ButtonProps } from "@/types/props";

import { LineChart } from "lucide-react";

import { Button } from "../ui/button";

const LineViewBtn = ({ handleClick, isActive }: ButtonProps) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      onClick={handleClick}
      aria-label="Line stats"
    >
      <LineChart className="h-4 w-4" />
    </Button>
  )
}

export default LineViewBtn;