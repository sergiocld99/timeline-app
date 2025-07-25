import axios from "axios";
import { useState } from "react";
import { backendBaseUrl } from "../constants";
import './LocationForm.scss';

const LocationForm = ({ onLocationAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    zipcode: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(`${backendBaseUrl}/locations`, formData).then(response => {
      alert(`Location "${response.data.name}" added successfully!`);
      setFormData({
        name: "",
        latitude: "",
        longitude: "",
        zipcode: "",
        notes: "",
      });
      onLocationAdded();
    }).catch(error => {
      console.error("There was an error adding the location!", error);
      alert("Failed to add location. Please try again.");
    });
  }

  return (
    <div className="page-form location-form container">
      <h2>Add Location</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" autoComplete="location" value={formData.name} onChange={handleChange} required />

        <label htmlFor="latitude">Latitude:</label>
        <input type="number" id="latitude" name="latitude" autoComplete="latitude" value={formData.latitude} onChange={handleChange} required />

        <label htmlFor="longitude">Longitude:</label>
        <input type="number" id="longitude" name="longitude" autoComplete="longitude" value={formData.longitude} onChange={handleChange} required />

        <label htmlFor="zipcode">Zipcode:</label>
        <input type="text" id="zipcode" name="zipcode" value={formData.zipcode} onChange={handleChange} />

        <label htmlFor="notes">Notes:</label>
        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />

        <button type="submit">Save</button>
      </form>
    </div>
  )
}

export default LocationForm;