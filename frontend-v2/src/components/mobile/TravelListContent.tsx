import type { Travel, TravelStats } from "@/types/travel";

import { extractDate, extractTime, getEmojiForMode, getHoursAndMinutes } from "@/utils";
import { useTravelStats } from "@/hooks/useTravelStats";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { renderPoint } from "../render/coordinates";

type Props = {
  travels: Travel[];
  stats?: TravelStats;
}

const TravelListContent = ({ travels, stats: initialStats }: Props) => {
  const { stats } = useTravelStats(travels, initialStats);

  const {
    averageLatitude: totalLat,
    averageLongitude: totalLong,
    totalDistance = 0,
    totalMinutes = 0,
    placesVisited
  } = stats || {}

  return (
    <div className="flex flex-col gap-4">
      {travels.map((travel) => (
        <div key={travel._id} className="flex flex-col gap-2">
          <Item variant="outline">
            <ItemMedia variant="icon">
              {getEmojiForMode(travel.modeOfTransport)}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{extractDate(travel.startTime)} • {travel.distance} km</ItemTitle>
              <ItemDescription>
                From: {travel.origin.name} ({extractTime(travel.startTime)}) <br /> To: {travel.destination.name} ({extractTime(travel.endTime)})
              </ItemDescription>
            </ItemContent>
          </Item>
        </div>
      ))}

      <Item variant="muted">
        <ItemContent>
          <ItemTitle>{placesVisited?.count || 0} places • {totalDistance.toFixed(0)} km • {getHoursAndMinutes(totalMinutes)}</ItemTitle>
          <ItemDescription>
            {totalLat && totalLong && renderPoint(totalLat, totalLong) || ""}
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  )
}

export default TravelListContent;