import { Copy } from "lucide-react"
import { Button } from "../ui/button"
import { ButtonProps } from "@/types/props"

const CopyButton = ({handleClick}: ButtonProps) => {
  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      title="Copy coordinates"
      className="h-6 w-6 p-0 mx-3"
    >
      <Copy className="h-3 w-3" />
    </Button>
  )
}

export default CopyButton
