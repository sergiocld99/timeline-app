import { Copy } from "lucide-react"
import { Button } from "../ui/button"

type Props = {
  handleCopy: () => void
}

const CopyButton = ({handleCopy}: Props) => {
  return (
    <Button
      onClick={handleCopy}
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
