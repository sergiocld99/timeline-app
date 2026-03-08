import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    firebaseUid: { type: String, unique: true, sparse: true },
});

const User = mongoose.model('User', UserSchema);

export default User;

