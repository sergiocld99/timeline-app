import { RewindIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/types/props";

const PreviousMonthBtn = ({ handleClick }: ButtonProps) => {
  return (
    <Button aria-label="Previous month" title="Previous month" type="button" variant="outline" onClick={handleClick}>
      <RewindIcon className="h-4 w-4" />
    </Button>
  )
}

export default PreviousMonthBtn
