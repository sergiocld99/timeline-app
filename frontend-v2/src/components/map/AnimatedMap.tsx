import type { Travel } from "@/types/travel"

import { Marker } from "react-leaflet"

import CameraFollow from "./CameraFollow"
import PolylineLayer from "./PolylineLayer"
import { useSegments } from "./useSegments"
import { pulsingIcon } from "./icons"

type Props = {
  travels: Travel[]
  isAnimating: boolean
}

const AnimatedMap = ({ travels, isAnimating }: Props) => {
  const { segments, animPosition, animState } = useSegments({ travels, isAnimating })

  return <>
    <CameraFollow position={animPosition} />
    <PolylineLayer
      segments={segments}
      segmentIndex={animState.currentSegmentIndex}
      segmentFraction={animState.segmentFraction}
    />
    <Marker position={animPosition} icon={pulsingIcon} />
  </>
}

export default AnimatedMap