import mongoose from "mongoose";

const acceptedModesOfTransport = ['car', 'taxi', 'bus', 'train', 'subway', 'ferry', 'walking', 'mixed', 'other'];

const TravelSchema = new mongoose.Schema({
    userId: { type: Number, required: false },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    origin: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    modeOfTransport: { type: String, enum: acceptedModesOfTransport, required: true },
    distance: { type: Number, required: true }, // in kilometers
    price: { type: Number, required: false },
    line: { type: String, required: false },
    crosses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cross', required: false }]
});

// Unique constraint per user: same user cannot have duplicate startTime + origin
// This allows different users to have travels with the same startTime + origin
TravelSchema.index({ userId: 1, startTime: 1, origin: 1 }, { unique: true, sparse: true });
// Keep a non-unique index on startTime + origin for query performance
TravelSchema.index({ startTime: 1, origin: 1 });

const Travel = mongoose.model('Travel', TravelSchema);

export default Travel;