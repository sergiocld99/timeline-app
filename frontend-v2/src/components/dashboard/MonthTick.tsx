import { getMonthDateRangeSearch } from "@/utils/dateRange";
import { Link } from "@/i18n/routing";

type ChartEntry = {
  monthKey: string;
};

type Props = {
  x?: number;
  y?: number;
  payload?: { value: string; index: number };
  chartData: ChartEntry[];
  tickColor: string;
};

const MonthTick = ({ x, y, payload, chartData, tickColor }: Props) => {
  if (x == null || y == null || !payload) return null;

  const entry = chartData[payload.index];
  if (!entry?.monthKey) return null;

  const href = `/travels?${getMonthDateRangeSearch(entry.monthKey)}`;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-24} y={-2} width={48} height={20} className="overflow-visible">
        <Link
          href={href}
          className="block text-center text-[10px] font-['Space_Mono'] cursor-pointer"
          style={{ color: tickColor }}
        >
          {payload.value}
        </Link>
      </foreignObject>
    </g>
  );
};

export default MonthTick