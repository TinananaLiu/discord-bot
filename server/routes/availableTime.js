import express from "express";
import {
  createAvailableTime,
  getAvailableTime,
  getAvailableTimeByDate,
  createReserveTime,
  getTimeSchedule,
} from "../controllers/availableTime.js";

const router = express.Router();

router.post("/teacher/:userId", createAvailableTime);
router.get("/teacher/:userId", getAvailableTime);
router.get("/date/:date", getAvailableTimeByDate);
router.post("/student/:userId", createReserveTime);
router.get("/user/:userId", getTimeSchedule);

export default router;
