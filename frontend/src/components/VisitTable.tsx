import type { Visit } from '../../types/travel';
import { extractDate, extractTime, getHoursAndMinutes } from '../utils';
import { renderTotalWeightsCell, renderWeight } from '../utils/weight';

import './VisitTable.scss';

type Props = {
  visits: Visit[];
}

const VisitTable = ({ visits }: Props) => {
  const totalMinutes = visits.reduce((sum, visit) => sum + visit.durationMinutes, 0);
  const totalLat = visits.reduce((sum, visit) => sum + visit.location.latitude * visit.weight.percentage, 0) / 100
  const totalLong = visits.reduce((sum, visit) => sum + visit.location.longitude * visit.weight.percentage, 0) / 100

  return (
    <div className="page-table visit-table container">
      <h2>Last 30 Days Visits</h2>
      <table>
        <thead>
          <tr>
            <th className='date-th'>Date</th>
            <th>Location</th>
            <th>Arrival</th>
            <th>Departure</th>
            <th>Duration</th>
            <th className='weight-th'>Weight</th>
          </tr>
        </thead>
        <tbody>
          {visits.map(v => (
            <tr key={v._id}>
              <td>{extractDate(v.date)}</td>
              <td>{v.location.name}</td>
              <td>{extractTime(v.arrivalTime)}</td>
              <td>{extractTime(v.departureTime)}</td>
              <td>{getHoursAndMinutes(v.durationMinutes)}</td>
              <td>{renderWeight(v)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td colSpan={3}>{totalLat.toFixed(4)}, {totalLong.toFixed(4)}</td>
            <td>{getHoursAndMinutes(totalMinutes)}</td>
            <td>{renderTotalWeightsCell(visits)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default VisitTable;