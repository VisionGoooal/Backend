import express from "express";
import { getAllUsers } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getAllUsers);

export default router;
