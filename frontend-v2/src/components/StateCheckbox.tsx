import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ReactNode } from "react";

type Props = {
  id: string,
  children: ReactNode,
  stateStatus: boolean,
  stateSetter: (newStatus: boolean) => void,
}

export const StateCheckbox = ({
  id,
  children,
  stateStatus,
  stateSetter
}: Props) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={stateStatus}
        onCheckedChange={(checked) => stateSetter(checked === true)}
      />
      <Label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 cursor-pointer"
      >
        {children}
      </Label>
    </div>
  )
}
