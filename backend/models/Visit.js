import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema({
    userId: { type: Number, required: false },
    date: { type: Date, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    arrivalTime: { type: Date, required: true },
    departureTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
});

VisitSchema.index({ date: 1, location: 1, arrivalTime: 1 }, { unique: true });

const Visit = mongoose.model('Visit', VisitSchema);

export default Visit;