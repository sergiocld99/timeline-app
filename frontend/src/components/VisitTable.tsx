import type { Visit } from '../../types/travel';
import { extractDate, extractTime, getHoursAndMinutes } from '../utils';

import './VisitTable.scss';

type Props = {
  visits: Visit[];
}

const VisitTable = ({ visits }: Props) => {
  const totalMinutes = visits.reduce((sum, visit) => sum + visit.durationMinutes, 0);

  return (
    <div className="page-table visit-table container">
      <h2>Last 30 Days Visits</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Arrival</th>
            <th>Departure</th>
            <th>Duration</th>
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
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Total</td>
            <td>{getHoursAndMinutes(totalMinutes)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default VisitTable;