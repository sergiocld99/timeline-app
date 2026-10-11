import type { Location } from "@/types/location";;

import { MapPin } from "lucide-react";

import { Link } from "@/i18n/routing";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { renderLocationWithZipcode } from "../render/location";

type Props = {
  locations: Location[];
}

const LocationListContent = ({ locations }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {locations.map((location) => (
        <div key={location._id} className="flex flex-col gap-2">
          <Item variant="outline" asChild className="hover:bg-accent/50">
            <Link href={`/travels/to/${location._id}`}>
              <ItemMedia variant="icon">
                <MapPin />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{renderLocationWithZipcode(location)}</ItemTitle>
                <ItemDescription>
                  {location.partido && <span className="block font-medium text-emerald-600 dark:text-emerald-400">{location.partido}</span>}
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        </div>
      ))}
    </div>
  )
}

export default LocationListContent;