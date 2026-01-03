import { Button } from "../ui/button";
import { PlaneTakeoffIcon } from "lucide-react";

const BUTTON_TITLE = "Departures"

type Props = {
  size: "sm" | "lg"
}

const DeparturesAction = ({ size }: Props) => {
  return (
    <Button
      size={size}
      variant="outline"
      title={BUTTON_TITLE}
    >
      <PlaneTakeoffIcon className="h-4 w-4" />
    </Button>
  )
}

export default DeparturesAction