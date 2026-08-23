import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

type Props = {
  position: [number, number] | null
  zoom?: number
}

const CameraFollow = ({ position, zoom }: Props) => {
  const map = useMap()
  const lastPanRef = useRef(0)
  const lastZoomRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!position) return
    const now = Date.now()
    if (now - lastPanRef.current < 80) return
    lastPanRef.current = now
    map.panTo(position, { animate: true, duration: 0.3 })
  }, [map, position])

  useEffect(() => {
    if (zoom === undefined || lastZoomRef.current === zoom) return
    lastZoomRef.current = zoom
    map.setZoom(zoom)
  }, [map, zoom])

  return null
}

export default CameraFollow