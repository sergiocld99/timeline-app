import { Button } from "../ui/button";
import { PlaneLandingIcon } from "lucide-react";

const BUTTON_TITLE = "Arrivals"

type Props = {
  size: "sm" | "lg"
}

const ArrivalsAction = ({ size }: Props) => {
  return (
    <Button
      size={size}
      variant="outline"
      title={BUTTON_TITLE}
    >
      <PlaneLandingIcon className="h-4 w-4" />
    </Button>
  )
}

export default ArrivalsAction