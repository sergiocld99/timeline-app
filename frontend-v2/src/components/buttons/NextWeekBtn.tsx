import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/types/props";
import { FastForwardIcon } from "lucide-react";

const NextWeekBtn = ({ handleClick }: ButtonProps) => {
  return (
    <Button type="button" variant="outline" onClick={handleClick}>
      <FastForwardIcon className="h-4 w-4" />
    </Button>
  )
}

export default NextWeekBtn
