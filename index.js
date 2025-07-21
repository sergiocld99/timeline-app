import e from "express";
import dotenv from "dotenv";
import cors from "cors";

import travelRoutes from "./routes/travelRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import connectToDatabase from "./config/database.js";

dotenv.config();

const app = e();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(e.json());

app.use('/api/travels', travelRoutes);
app.use('/api/locations', locationRoutes);

connectToDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});