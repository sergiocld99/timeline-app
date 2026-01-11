import { PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/types/props";

const PreviousWeekBtn = ({ handleClick }: ButtonProps) => {
  return (
    <Button aria-label="Previous week" title="Previous week" type="button" variant="outline" onClick={handleClick}>
      <PlayIcon className="h-4 w-4 rotate-180" />
    </Button>
  )
}

export default PreviousWeekBtn
