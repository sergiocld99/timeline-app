import './TravelTable.scss';

const getHoursAndMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

const TravelTable = ({ travels }) => {
  const totalMinutes = travels.reduce((total, travel) => total + travel.duration, 0);
  const totalDistance = travels.reduce((total, travel) => total + travel.distance, 0);

  return (
    <div className="page-table travel-table container">
      <h2>Last 30 Days Travels</h2>
      <table>
        <thead>
          <tr>
            <th className='date-th'>Date</th>
            <th>From</th>
            <th>To</th>
            <th>Distance</th>
            <th>Duration</th>
            <th className='speed-th'>Speed</th>
          </tr>
        </thead>
        <tbody>
          {travels.map(t => (
            <tr key={t._id}>
              <td>{t.shortDate}</td>
              <td>{t.origin.name}</td>
              <td>{t.destination.name}</td>
              <td>{t.distance} km</td>
              <td>{t.duration} min</td>
              <td>{t.speed.toFixed(1)} km/h</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td colSpan="2"></td>
            <td>{totalDistance.toFixed(0)} km</td>
            <td>{getHoursAndMinutes(totalMinutes)}</td>
            <td>{(totalDistance / (totalMinutes / 60)).toFixed(1)} km/h</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TravelTable;