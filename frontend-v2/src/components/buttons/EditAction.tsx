import { ButtonProps } from "@/types/props";
import { Button } from "../ui/button";
import { Edit3 } from "lucide-react";

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