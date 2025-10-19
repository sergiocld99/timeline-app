import mongoose from "mongoose";

const CrossSchema = new mongoose.Schema({
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
});

CrossSchema.index({ name: 1 }, { unique: true });

const Cross = mongoose.model('Cross', CrossSchema);

export default Cross;