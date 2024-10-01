import express from "express";
import {
  createAvailableTime
} from "../controllers/availableTime.js"

const router = express.Router();

router.post("/teacher/:userId", createAvailableTime);

export default router;