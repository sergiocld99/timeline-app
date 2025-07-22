import mongoose from "mongoose";

const connectToDatabase = async () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("✅ Database connected successfully");
  }).catch((error) => {
    console.error("❌ Database connection failed:", error);
  });
};

export default connectToDatabase;