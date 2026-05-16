import type { Visit } from "@/types/visit";;

import { useTranslations, useFormatter } from "next-intl";

import { extractTime, getHoursAndMinutes } from "@/utils";
import { renderNiceDate } from "@/utils/date";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { renderPoint } from "../render/coordinates";
import { renderLocationWithZipcode } from "../render/location";

type Props = {
  visits: Visit[];
}

const VisitListContent = ({ visits }: Props) => {
  const t = useTranslations("Visits");
  const format = useFormatter();
  const totalMinutes = visits.reduce((sum, visit) => sum + visit.durationMinutes, 0);
  const totalPercentage = visits.reduce((sum, visit) => sum + visit.weight.percentage, 0);
  const totalLat = visits.reduce((sum, visit) => sum + visit.location.latitude * visit.weight.percentage, 0) / totalPercentage;
  const totalLong = visits.reduce((sum, visit) => sum + visit.location.longitude * visit.weight.percentage, 0) / totalPercentage;

  return (
    <div className="flex flex-col gap-4">
      {visits.map((visit) => (
        <div key={visit._id} className="flex flex-col gap-2">
          <Item variant="outline">
            <ItemMedia variant="icon">
              {visit.weight.color}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {renderNiceDate(visit.date, format)} • {getHoursAndMinutes(visit.durationMinutes)}
              </ItemTitle>
              <ItemDescription>
                {renderLocationWithZipcode(visit.location)} <br /> {extractTime(visit.arrivalTime)} - {extractTime(visit.departureTime)}
              </ItemDescription>
            </ItemContent>
          </Item>
        </div>
      ))}

      <Item variant="muted">
        <ItemContent>
          <ItemTitle>{t("visitsCount", { count: visits.length })} • {getHoursAndMinutes(totalMinutes)}</ItemTitle>
          <ItemDescription>
            {totalLat && totalLong && renderPoint(totalLat, totalLong) || ""}
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  )
}

export default VisitListContent;