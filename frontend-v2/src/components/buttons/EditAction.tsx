import { Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/types/props";

const BUTTON_TITLE = "Edit"

const EditAction = ({ handleClick }: ButtonProps) => {
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title={BUTTON_TITLE}
    >
      <Edit3 className="h-4 w-4" />
    </Button>
  )
}

export default EditAction