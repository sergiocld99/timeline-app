import type { ButtonProps } from "@/types/props";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

const ApplyButton = ({ handleClick, disabled }: ButtonProps) => {
  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Check className="h-4 w-4 mr-2" />
      Apply
    </Button>
  )
}

export default ApplyButton
