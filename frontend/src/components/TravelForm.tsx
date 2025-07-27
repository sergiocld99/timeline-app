import { ChangeEvent, FormEvent, useState } from "react";

import type { Location } from "../../types/travel";
import useLocations from "../hooks/useLocations";
import VisitService from "../services/VisitService";
import TravelService from "../services/TravelService";
import './TravelForm.scss';

type Props = {
  onTravelAdded: () => void;
}

const TravelForm = ({ onTravelAdded }: Props) => {
  const { locations, refetch } = useLocations();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    startTime: new Date().toISOString().slice(0, 16), // Format to YYYY-MM-DDTHH:mm
    endTime: new Date().toISOString().slice(0, 16), // Format to YYYY-MM-DDTHH:mm
    modeOfTransport: "car",
    distance: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    TravelService.createTravel(formData).then(response => {
      VisitService.persistIfNeeded(formData.startTime.split('T')[0]).then((persisted) => {
        if (persisted) {
          alert("Travel with visit added successfully!");
        } else {
          alert("Travel added successfully");
        }
      });

      setFormData({
        ...formData,
        origin: formData.destination,
        destination: formData.origin,
        startTime: formData.endTime,
        distance: "",
      });
      onTravelAdded();
      refetch();
    }).catch(error => {
      console.error("There was an error adding the travel!", error, formData);
      alert("Failed to add travel. Please try again.");
    });
  };

  const renderLocation = (location: Location) => (
    <option key={location._id} value={location._id}>
      {location.zipcode} - {location.name}
    </option>
  );

  return (
    <div className="page-form travel-form container">
      <h2>Add Travel</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="origin">Origin</label>
        <select
          id="origin"
          name="origin"
          value={formData.origin}
          onChange={handleChange}
          required
        >
          <option value="">Select Origin</option>
          {locations.map((location) => renderLocation(location))}
        </select>

        <label htmlFor="destination">Destination</label>
        <select
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          required
        >
          <option value="">Select Destination</option>
          {locations.map((location) => renderLocation(location))}
        </select>

        <label htmlFor="startTime">Start Time</label>
        <input
          type="datetime-local"
          id="startTime"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        />

        <label htmlFor="endTime">End Time</label>
        <input
          type="datetime-local"
          id="endTime"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required
        />

        <label htmlFor="modeOfTransport">Mode of Transport</label>
        <select
          id="modeOfTransport"
          name="modeOfTransport"
          value={formData.modeOfTransport}
          onChange={handleChange}
          required
        >
          <option value="car">🚘 Car</option>
          <option value="bus">🚍 Bus</option>
          <option value="train">🚉 Train</option>
          <option value="subway">🚇 Subway</option>
          <option value="walking">🚶🏽 Walking</option>
          <option value="other">Other</option>
        </select>

        <label htmlFor="distance">Distance (km)</label>
        <input
          type="number"
          id="distance"
          name="distance"
          value={formData.distance}
          onChange={handleChange}
          required
          min="0"
          step="0.1"
        />

        <button type="submit">Create</button>
      </form>
    </div>
  )
}

export default TravelForm;