import './LocationTable.scss';

const LocationTable = ({ locations }) => {
  return (
    <div className="page-table location-table container">
      <h2>Locations</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Zipcode</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {locations.map(location => (
            <tr key={location._id}>
              <td>{location.name}</td>
              <td>{location.latitude.toFixed(4)}</td>
              <td>{location.longitude.toFixed(4)}</td>
              <td>{location.zipcode}</td>
              <td>{location.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LocationTable;