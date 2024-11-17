import express from "express";

import config from "./config/config.js";
import availableTimeRouter from "./routes/availableTime.js";
import userInfoRouter from "./routes/userInfo.js";

const app = express();

app.use(express.json());

app.use("/api/available_time/", availableTimeRouter);
app.use("/api/user_info/", userInfoRouter);

app.listen(config.app.port, () => {
  console.log(`Server is running on http://localhost:${config.app.port}`);
});
