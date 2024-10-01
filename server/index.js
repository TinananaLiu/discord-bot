import express from "express";
import dotenv from "dotenv";

import availableTimeRouter from "./routes/availableTime.js";


dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/api/available_time/", availableTimeRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});