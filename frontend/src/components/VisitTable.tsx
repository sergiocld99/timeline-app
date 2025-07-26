import type { Visit } from '../../types/travel';

import './VisitTable.scss';

type Props = {
  visits: Visit[];
}

const VisitTable = ({ visits }: Props) => {
  return (
    <div className="page-table visit-table container">
      <h2>Visits</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Arrival</th>
            <th>Departure</th>
            <th>Minutes</th>
          </tr>
        </thead>
        <tbody>
          {visits.map(v => (
            <tr key={v._id}>
              <td>{v.date.split('T')[0].substring(5)}</td>
              <td>{v.location.name}</td>
              <td>{v.arrivalTime.split('T')[1].substring(0,5)}</td>
              <td>{v.departureTime.split('T')[1].substring(0,5)}</td>
              <td>{v.durationMinutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VisitTable;