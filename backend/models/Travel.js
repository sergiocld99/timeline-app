import mongoose from "mongoose";

const acceptedModesOfTransport = ['car', 'taxi', 'bus', 'train', 'subway', 'ferry', 'walking', 'other'];

const TravelSchema = new mongoose.Schema({
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    origin: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    modeOfTransport: { type: String, enum: acceptedModesOfTransport, required: true },
    distance: { type: Number, required: true }, // in kilometers
    price: { type: Number, required: false },
    crosses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cross', required: false }]
});

TravelSchema.index({ startTime: 1, origin: 1 }, { unique: true });

const Travel = mongoose.model('Travel', TravelSchema);

export default Travel;