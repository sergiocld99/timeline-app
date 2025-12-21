import { MapIcon } from "lucide-react"
import { Button } from "../ui/button"

type Props = {
  handleClick: () => void
}

const MapButton = ({ handleClick }: Props) => {
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <MapIcon className="h-4 w-4" />
      View Map
    </Button>
  )
}

export default MapButton
