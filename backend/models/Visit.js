import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema({
    userId: { type: Number, required: false },
    date: { type: Date, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    arrivalTime: { type: Date, required: true },
    departureTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
});

// Unique constraint per user: same user cannot have duplicate date + location + arrivalTime
// This allows different users to have visits with the same date + location + arrivalTime
VisitSchema.index({ userId: 1, date: 1, location: 1, arrivalTime: 1 }, { unique: true, sparse: true });
// Keep a non-unique index on date + location + arrivalTime for query performance
VisitSchema.index({ date: 1, location: 1, arrivalTime: 1 });

const Visit = mongoose.model('Visit', VisitSchema);

export default Visit;