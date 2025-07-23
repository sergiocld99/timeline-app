import axios from "axios";
import { useState, useEffect } from "react";
import { backendBaseUrl } from "../constants";
import './LocationTable.scss';

const LocationTable = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    axios.get(`${backendBaseUrl}/locations`)
      .then(response => {
        setLocations(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the locations!", error);
      });
  }, []);

  return (
    <div className="location-table container">
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
            <tr key={location.id}>
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