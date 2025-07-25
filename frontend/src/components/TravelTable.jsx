import './TravelTable.scss';

const TravelTable = ({ travels }) => {
  return (
    <div className="page-table travel-table container">
      <h2>Recent Travels</h2>
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
      </table>
    </div>
  );
}

export default TravelTable;