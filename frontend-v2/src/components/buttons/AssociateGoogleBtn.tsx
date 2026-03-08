import { ButtonProps } from "@/types/props";
import { Button } from "../ui/button";

export const AssociateGoogleBtn = ({ handleClick, disabled }: ButtonProps) => {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={handleClick}
      disabled={disabled}
      className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
    >
      Associate Google
    </Button>
  )
}