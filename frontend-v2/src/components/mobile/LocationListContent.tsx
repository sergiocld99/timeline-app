import type { Location } from "@/types/travel";

import { Item, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { renderLocationWithZipcode } from "../render/location";

type Props = {
  locations: Location[];
}

const LocationListContent = ({ locations }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {locations.map((location) => (
        <div key={location._id} className="flex flex-col gap-2">
          <Item variant="outline">
            <ItemContent>
              <ItemTitle>{renderLocationWithZipcode(location)}</ItemTitle>
              <ItemDescription>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} - {location.notes}
              </ItemDescription>
            </ItemContent>
          </Item>
        </div>
      ))}
    </div>
  )
}

export default LocationListContent;