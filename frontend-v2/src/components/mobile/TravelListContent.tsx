import type { Travel, TravelStats } from "@/types/travel";;

import { useTranslations } from "next-intl";

import { extractTime, getEmojiForMode, getHoursAndMinutes } from "@/utils";
import { cn } from "@/lib/utils";
import { renderNiceDate } from "@/utils/date";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { renderPoint } from "../render/coordinates";

type Props = {
  travels: Travel[];
  stats?: TravelStats;
}

const TravelListContent = ({ travels, stats }: Props) => {
  const t = useTranslations();

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
              <ItemTitle>
                {renderNiceDate(travel.startTime, t)} • {travel.distance} km
              </ItemTitle>
              <ItemDescription>
                {t("Travels.tableHeaders.from")}: {travel.origin.name} ({extractTime(travel.startTime)}) <br /> 
                {t("Travels.tableHeaders.to")}: {travel.destination.name} ({extractTime(travel.endTime)})
              </ItemDescription>
            </ItemContent>
          </Item>
        </div>
      ))}

      <Item variant="muted">
        <ItemContent>
          <ItemTitle>{t("Travels.footer.placesCount", { count: placesVisited?.count || 0 })} • {totalDistance.toFixed(0)} km • {getHoursAndMinutes(totalMinutes)}</ItemTitle>
          <ItemDescription>
            {totalLat && totalLong && renderPoint(totalLat, totalLong) || ""}
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  )
}

export default TravelListContent;