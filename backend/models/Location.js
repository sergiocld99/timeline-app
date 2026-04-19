import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    notes: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    zipcode: { type: String },
    partido: { type: String },
});

LocationSchema.index({ name: 1, latitude: 1 }, { unique: true });

const Location = mongoose.model('Location', LocationSchema);

export default Location;