import React from "react";
import axios from "axios";
import './LocationForm.scss';

const LocationForm = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    latitude: "",
    longitude: "",
    zipcode: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:3000/api/locations', formData).then(response => {
      alert("Location added successfully!");
      setFormData({
        name: "",
        latitude: "",
        longitude: "",
        zipcode: "",
        notes: "",
      });
    }).catch(error => {
      console.error("There was an error adding the location!", error);
      alert("Failed to add location. Please try again.");
    });
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="location-form container">
      <h2>Add Location</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label htmlFor="latitude">Latitude:</label>
        <input type="number" name="latitude" value={formData.latitude} onChange={handleChange} required />

        <label htmlFor="longitude">Longitude:</label>
        <input type="number" name="longitude" value={formData.longitude} onChange={handleChange} required />

        <label htmlFor="zipcode">Zipcode:</label>
        <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} />

        <label htmlFor="notes">Notes:</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} />

        <button type="submit">Save</button>
      </form>
    </div>
  )
}

export default LocationForm;