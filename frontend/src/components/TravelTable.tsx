import { ChangeEvent, useState } from 'react';
import type { Travel } from '../../types/travel';
import { getEmojiForMode, getTodayEndTime, getHoursAndMinutes, getStartDateFromCurrent } from '../utils';
import { renderTotalWeightsCell, renderWeight } from '../utils/weight';

import './TravelTable.scss';

type Props = {
  travels: Travel[];
  onUpdateDateRange: (dateFrom: string, dateTo: string) => void;
}

const TravelTable = ({ travels, onUpdateDateRange }: Props) => {
  const [dateFrom, setDateFrom] = useState(getStartDateFromCurrent(30))
  const [dateTo, setDateTo] = useState(getTodayEndTime())

  const totalMinutes = travels.reduce((total, travel) => total + travel.duration, 0);
  const totalDistance = travels.reduce((total, travel) => total + travel.distance, 0);

  const totalLat = travels.reduce((total, travel) => {
    const currentLat = (travel.origin.latitude + travel.destination.latitude) / 200
    return total + currentLat * travel.weight.percentage
  }, 0)

  const totalLong = travels.reduce((total, travel) => {
    const currentLong = (travel.origin.longitude + travel.destination.longitude) / 200
    return total + currentLong * travel.weight.percentage
  }, 0)

  const handleChangeDateFrom = (e: ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value)
  };

  const handleChangeDateTo = (e: ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value)
  };

  return (
    <div className="page-table travel-table container">
      <div className="page-header">
        <h2>From</h2>
        <input type="datetime-local" name="date_from" id="date_from" onChange={handleChangeDateFrom} value={dateFrom} />
        <h2>to</h2>
        <input type="datetime-local" name="date_to" id="date_to" onChange={handleChangeDateTo} value={dateTo} />
        <button type="button" onClick={() => onUpdateDateRange(dateFrom, dateTo)}>✅</button>
      </div>
      <table>
        <thead>
          <tr>
            <th className='date-th'>Date</th>
            <th>M</th>
            <th>From</th>
            <th>To</th>
            <th>Distance</th>
            <th>Duration</th>
            <th className='speed-th'>Speed</th>
            <th className='weight-th'>Weight</th>
          </tr>
        </thead>
        <tbody>
          {travels.map(t => (
            <tr key={t._id}>
              <td>{t.shortDate}</td>
              <td>{getEmojiForMode(t.modeOfTransport)}</td>
              <td>{t.origin.name}</td>
              <td>{t.destination.name}</td>
              <td>{t.distance} km</td>
              <td>{t.duration} min</td>
              <td>{t.speed.toFixed(1)} km/h</td>
              <td>{renderWeight(t)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td colSpan={3}>{totalLat.toFixed(4)}, {totalLong.toFixed(4)}</td>
            <td>{totalDistance.toFixed(0)} km</td>
            <td>{getHoursAndMinutes(totalMinutes)}</td>
            <td>{totalMinutes === 0 ? 0 : (totalDistance / (totalMinutes / 60)).toFixed(1)} km/h</td>
            <td>{renderTotalWeightsCell(travels)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TravelTable;