import e from "express";
import dotenv from "dotenv";
import cors from "cors";

import travelRoutes from "./routes/travelRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import statsRoutes from "./routes/statsRouter.js"
import connectToDatabase from "./config/database.js";

dotenv.config();

const app = e();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(e.json());

app.use('/api/travels', travelRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/stats', statsRoutes)

connectToDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});