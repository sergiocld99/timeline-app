import { ButtonProps } from "@/types/props";
import { Button } from "../ui/button";

export const TextButton = ({ handleClick, disabled, text }: ButtonProps) => {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={disabled}
    >
      {text}
    </Button>
  )
}