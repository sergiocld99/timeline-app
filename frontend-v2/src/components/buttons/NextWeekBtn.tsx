import type { ButtonProps } from "@/types/props";

import { PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const NextWeekBtn = ({ handleClick }: ButtonProps) => {
  return (
    <Button aria-label="Next week" title="Next week" type="button" variant="outline" onClick={handleClick}>
      <PlayIcon className="h-4 w-4" />
    </Button>
  )
}

export default NextWeekBtn
