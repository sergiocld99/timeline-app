import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

const CameraFollow = ({ position }: { position: [number, number] | null }) => {
  const map = useMap()
  const lastPanRef = useRef(0)

  useEffect(() => {
    if (!position) return
    const now = Date.now()
    if (now - lastPanRef.current < 80) return
    lastPanRef.current = now
    map.panTo(position, { animate: true, duration: 0.3 })
  }, [map, position])

  return null
}

export default CameraFollow