import type { Location } from "@/types/travel";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { renderLocationWithZipcode } from "../render/location";
import { MapPin } from "lucide-react";

type Props = {
  locations: Location[];
}

const LocationListContent = ({ locations }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {locations.map((location) => (
        <div key={location._id} className="flex flex-col gap-2">
          <Item variant="outline">
            <ItemMedia variant="icon">
              <MapPin />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{renderLocationWithZipcode(location)}</ItemTitle>
              <ItemDescription>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </ItemDescription>
            </ItemContent>
          </Item>
        </div>
      ))}
    </div>
  )
}

export default LocationListContent;