"use client";

import type { PlaceData } from "@/utils/monthlyPlaces";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { ACCENT3, WARNING } from "@/constants/colors";
import {
  getPlaceBalance,
  getPlaceGroup,
  getPlaceName,
  getVisitedMonthsSet,
  MONTHS_PER_YEAR,
  PLACE_GROUP_COLORS,
} from "@/utils/monthlyPlaces";

type Props = {
  zipcode: string;
  data?: PlaceData;
  prevData?: PlaceData;
};

const renderMonthGrid = (visitedMonths: Set<number>, color: string) => {
  const cells = Array.from({ length: MONTHS_PER_YEAR }, (_, i) => i + 1);
  const rows = [cells.slice(0, 4), cells.slice(4, 8), cells.slice(8, 12)];

  return (
    <div className="flex flex-col gap-[2px] w-full">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-[2px] w-full">
          {row.map((monthNum) => {
            const visited = visitedMonths.has(monthNum);
            return (
              <div
                key={monthNum}
                title={`${monthNum.toString().padStart(2, "0")}`}
                className="h-3 flex-1 rounded-[2px] bg-gray-700"
                style={visited ? { backgroundColor: color } : undefined}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const ZipcodeRow = ({ zipcode, data, prevData }: Props) => {
  const visitedCurrent = getVisitedMonthsSet(data, zipcode);
  const visitedPrev = getVisitedMonthsSet(prevData, zipcode);
  const name = getPlaceName(zipcode, data, prevData);
  const balance = getPlaceBalance(visitedCurrent, visitedPrev);
  const group = getPlaceGroup(visitedCurrent, visitedPrev);

  return (
    <TableRow key={zipcode} className="border-b border-[#2a2a3a]">
      <TableCell
        className="font-['Space_Mono'] text-[0.7rem] py-2"
        style={{ color: PLACE_GROUP_COLORS[group] }}
      >
        {zipcode}
      </TableCell>
      <TableCell
        className="font-['Space_Mono'] text-[0.7rem] py-2 truncate max-w-xs"
        style={{ color: PLACE_GROUP_COLORS[group] }}
      >
        {name}
      </TableCell>
      <TableCell className="py-2">
        {renderMonthGrid(visitedCurrent, ACCENT3)}
      </TableCell>
      <TableCell className="py-2">
        {renderMonthGrid(visitedPrev, WARNING)}
      </TableCell>
      <TableCell
        className="text-center font-['Space_Mono'] text-[0.9rem] py-2"
        style={{ color: PLACE_GROUP_COLORS[group] }}
      >
        {balance > 0 ? `+${balance}` : balance}
      </TableCell>
    </TableRow>
  );
};

export default ZipcodeRow;
