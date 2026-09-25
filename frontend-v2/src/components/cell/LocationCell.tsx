import type { TravelEditProps } from "@/types/travel"
import type { Location } from "@/types/location"

import { Selector } from "../selectors/Selector"

type Props = {
  editProps: TravelEditProps,
  field: 'origin' | 'destination',
  locations: Location[]
}

const LocationCell = ({ editProps, field, locations }: Props) => {
  const { travel, editingId, editValues, handleChange } = editProps

  if (editingId === travel._id) {
    const eligibleLocations = locations.filter(l => l.zipcode === travel[field].zipcode)

    return (
      <Selector
        value={editValues[field]}
        onValueChange={(value) => handleChange(field, value)}
        eligibleValues={eligibleLocations.map(l => ({ value: l.name, label: l.name }))}
        minLength={2}
      />
    )
  }

  return (
    <span className="text-gray-900 dark:text-white">{travel[field].name}</span>
  )
}

export default LocationCell