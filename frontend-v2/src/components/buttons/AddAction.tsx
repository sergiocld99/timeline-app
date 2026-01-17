import type { ButtonProps } from "@/types/props";

import { CirclePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

const BUTTON_TITLE = "Add"

const AddAction = ({ handleClick }: ButtonProps) => {
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={BUTTON_TITLE}
    >
      <CirclePlus className="h-4 w-4" />
    </Button>
  )
}

export default AddAction