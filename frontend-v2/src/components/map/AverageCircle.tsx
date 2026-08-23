import { Circle } from "react-leaflet";

import { COLOR_LIGHT_BLUE } from "./constants";

type Props = {
  lat: number,
  lng: number,
  avgDistance: number
}

const AverageCircle = ({ lat, lng, avgDistance }: Props) => (
  <Circle
    center={[lat, lng]}
    radius={avgDistance * 1000}
    pathOptions={{
      color: COLOR_LIGHT_BLUE,
      fillColor: COLOR_LIGHT_BLUE,
      fillOpacity: 0.15,
      weight: 2,
      dashArray: "5, 5"
    }}
  />
)

export default AverageCircle