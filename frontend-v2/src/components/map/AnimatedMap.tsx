import type { Travel } from "@/types/travel"

import { Marker } from "react-leaflet"

import CameraFollow from "./CameraFollow"
import PolylineLayer from "./PolylineLayer"
import { useSegments } from "./useSegments"
import { pulsingIcon } from "./icons"

type Props = {
  travels: Travel[]
  isAnimating: boolean
  zoom?: number
}

const AnimatedMap = ({ travels, isAnimating, zoom }: Props) => {
  const { segments, animPosition, animState } = useSegments({ travels, isAnimating, zoom })

  return <>
    <CameraFollow position={animPosition} zoom={zoom} />
    <PolylineLayer
      segments={segments}
      segmentIndex={animState.currentSegmentIndex}
      segmentFraction={animState.segmentFraction}
    />
    <Marker position={animPosition} icon={pulsingIcon} />
  </>
}

export default AnimatedMap