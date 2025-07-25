import { useState } from "react";
import axios from "axios";

import useLocations from "../hooks/useLocations";
import { backendBaseUrl } from "../constants";
import './TravelForm.scss';

const TravelForm = ({ onTravelAdded }) => {
  const { locations, refetch } = useLocations();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    startTime: "",
    endTime: "",
    modeOfTransport: "car",
    distance: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${backendBaseUrl}/travels`, formData).then(response => {
      alert(`Travel from "${response.data.origin}" added successfully!`);
      setFormData({
        origin: "",
        destination: "",
        startTime: "",
        endTime: "",
        modeOfTransport: "car",
        distance: "",
      });
      onTravelAdded();
      refetch();
    }).catch(error => {
      console.error("There was an error adding the travel!", error);
      alert("Failed to add travel. Please try again.");
    });
  };

  const renderLocation = (location) => (
    <option key={location.id} value={location.name}>
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
        <button type="submit">Create</button>
      </form>
    </div>
  )
}

export default TravelForm;