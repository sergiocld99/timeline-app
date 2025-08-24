import { ChangeEvent, useState } from "react";
import { getStartDateFromCurrent, getTodayEndTime } from "../utils";

type Props = {
  onUpdate: (dateFrom: string, dateTo: string) => void;
}

const DateRangeSelector = ({ onUpdate }: Props) => {
  const [dateFrom, setDateFrom] = useState(getStartDateFromCurrent(30))
  const [dateTo, setDateTo] = useState(getTodayEndTime())

  const handleChangeDateFrom = (e: ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value)
  };

  const handleChangeDateTo = (e: ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value)
  };

  return (
    <div className="page-header">
      <h2>From</h2>
      <input type="datetime-local" name="date_from" id="date_from" onChange={handleChangeDateFrom} value={dateFrom} />
      <h2>to</h2>
      <input type="datetime-local" name="date_to" id="date_to" onChange={handleChangeDateTo} value={dateTo} />
      <button type="button" onClick={() => onUpdate(dateFrom, dateTo)}>✅</button>
    </div>
  )
}

export default DateRangeSelector;