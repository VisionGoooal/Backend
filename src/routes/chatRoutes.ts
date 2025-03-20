import express from "express";
import { protect } from "../middleware/authMiddleware";
import { sendMessage, getMessages } from "../controllers/chatController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Real-time chat management
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post("/", protect, sendMessage);

/**
 * @swagger
 * /api/chat/{userId}:
 *   get:
 *     summary: Get chat messages between two users
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of chat messages
 */
router.get("/:userId", protect, getMessages);

export default router;
