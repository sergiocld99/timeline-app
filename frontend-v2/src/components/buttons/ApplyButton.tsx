import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/types/props";
import { Check } from "lucide-react";

const ApplyButton = ({ handleClick }: ButtonProps) => {
  return (
    <Button
      type="button"
      onClick={handleClick}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <Check className="h-4 w-4 mr-2" />
      Apply
    </Button>
  )
}

export default ApplyButton
