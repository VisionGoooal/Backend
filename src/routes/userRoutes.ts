import express from "express";
import { getAllUsers } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User listing for chat
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserShort:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userFullName:
 *           type: string
 *         profileImage:
 *           type: string
 *       example:
 *         _id: "user123"
 *         userFullName: "John Doe"
 *         profileImage: "/uploads/profile.jpg"
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (for chat or selection)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserShort'
 */
router.get("/", protect, getAllUsers);

export default router;
