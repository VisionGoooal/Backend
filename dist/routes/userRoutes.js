"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
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
router.get("/", authMiddleware_1.protect, authController_1.getAllUsers);
exports.default = router;
