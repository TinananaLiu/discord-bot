import express from "express";
import {
  createAvailableTime,
  getAvailableTime,
} from "../controllers/availableTime.js";

const router = express.Router();

router.post("/teacher/:userId", createAvailableTime);
router.get("/teacher/:userId", getAvailableTime);

export default router;
