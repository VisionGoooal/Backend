import express from "express";
import { getMessages, sendMessage } from "../controllers/chatController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:userId", protect, getMessages); // Get chat with another user
router.post("/", protect, sendMessage);       // Send a message (alternative to socket)

export default router;
