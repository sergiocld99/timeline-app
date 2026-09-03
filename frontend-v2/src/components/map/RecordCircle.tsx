import type { TravelRecordItem } from "@/types/travel"

import { Circle } from "react-leaflet"

import { calculateCenter } from "@/utils/location"

import { COLOR_RED } from "./constants"

type Props = {
  record: TravelRecordItem
}

const RecordCircle = ({ record }: Props) => (
  <Circle
    center={calculateCenter(record.origin, record.destination)}
    radius={record.value * 500}
    pathOptions={{
      color: COLOR_RED,
      fill: false,
      weight: 2,
      dashArray: "5, 5"
    }}
  />
)

export default RecordCircle