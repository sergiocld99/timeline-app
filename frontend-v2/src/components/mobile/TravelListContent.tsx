import type { Travel, TravelStats } from "@/types/travel";

import { extractTime, getEmojiForMode, getHoursAndMinutes } from "@/utils";
import { cn } from "@/lib/utils";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { renderPoint } from "../render/coordinates";

type Props = {
  travels: Travel[];
  stats?: TravelStats;
}

const TravelListContent = ({ travels, stats }: Props) => {
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
          <Item
            variant="outline"
            className={cn(travel.crosses?.length > 0 && "bg-yellow-50/50 dark:bg-yellow-900/10")}
          >
            <ItemMedia variant="icon">
              <div className="flex flex-col items-center">
                <span>{getEmojiForMode(travel.modeOfTransport)}</span>
                {travel.modeOfTransport === 'bus' && travel.line && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-[-4px]">
                    {travel.line}
                  </span>
                )}
              </div>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{travel.extractedDate} • {travel.distance} km</ItemTitle>
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