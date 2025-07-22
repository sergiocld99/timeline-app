import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    notes: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    zipcode: { type: String },
});

const Location = mongoose.model('Location', LocationSchema);

export default Location;