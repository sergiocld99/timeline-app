import { FastForwardIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/types/props";

const NextMonthBtn = ({ handleClick }: ButtonProps) => {
  return (
    <Button aria-label="Next month" title="Next month" type="button" variant="outline" onClick={handleClick}>
      <FastForwardIcon className="h-4 w-4" />
    </Button>
  )
}

export default NextMonthBtn
