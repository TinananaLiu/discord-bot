import express from "express";
import { createUserInfo } from "../controllers/userInfo.js";

const router = express.Router();

router.post("/student/:userId", createUserInfo);

export default router;
