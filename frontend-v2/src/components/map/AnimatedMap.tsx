import type { Travel } from "@/types/travel"

import { Marker } from "react-leaflet"

import CameraFollow from "./CameraFollow"
import PolylineLayer from "./PolylineLayer"
import { useSegments } from "./useSegments"
import { pulsingGreenIcon, pulsingIcon } from "./icons"

type Props = {
  travels: Travel[]
  isAnimating: boolean
  zoom?: number
}

const AnimatedMap = ({ travels, isAnimating, zoom }: Props) => {
  const { segments, animPosition, animState, pendingZoom } = useSegments({ travels, isAnimating, zoom })

  const hasFinished = animState.overallProgress === 1

  return <>
    <CameraFollow position={animPosition} zoom={pendingZoom} />
    <PolylineLayer
      segments={segments}
      segmentIndex={animState.currentSegmentIndex}
      segmentFraction={animState.segmentFraction}
    />
    <Marker position={animPosition} icon={hasFinished ? pulsingGreenIcon : pulsingIcon} />
  </>
}

export default AnimatedMap