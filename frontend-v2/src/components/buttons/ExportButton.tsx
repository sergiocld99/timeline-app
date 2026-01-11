import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/types/props"

const ExportButton = ({ handleClick }: ButtonProps) => {
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export
    </Button>
  )
}

export default ExportButton
