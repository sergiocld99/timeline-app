import { MoveLeftIcon } from "lucide-react"
import { Button } from "../ui/button"

const BackAction = () => {
  return (
    <Button
      size="lg"
      variant="outline"
      title="Go back"
    >
      <MoveLeftIcon className="h-4 w-4" />
    </Button>
  )
}

export default BackAction
