import express from "express";
import predictionController from "../controllers/predictionController";
// import { protect } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Predictions
 *   description: AI Match Predictions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Prediction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         match:
 *           type: string
 *         homeTeam:
 *           type: string
 *         awayTeam:
 *           type: string
 *         predictedScore:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "123abc"
 *         match: "Liverpool vs. Real Madrid"
 *         homeTeam: "Liverpool"
 *         awayTeam: "Real Madrid"
 *         predictedScore: "2-1"
 *         createdAt: "2024-03-25T12:00:00Z"

 *     PredictionInput:
 *       type: object
 *       properties:
 *         match:
 *           type: string
 *         homeTeam:
 *           type: string
 *         awayTeam:
 *           type: string
 *       required:
 *         - match
 *         - homeTeam
 *         - awayTeam
 *       example:
 *         match: "Man City vs PSG"
 *         homeTeam: "Man City"
 *         awayTeam: "PSG"
 */

/**
 * @swagger
 * /api/prediction:
 *   post:
 *     summary: Generate predictions automatically using AI
 *     tags: [Predictions]
 *     responses:
 *       201:
 *         description: Predictions created
 */
router.post("/", predictionController.createPredictionsAutomatically);

/**
 * @swagger
 * /api/prediction/post:
 *   post:
 *     summary: Create a post based on prediction
 *     tags: [Predictions]
 *     responses:
 *       201:
 *         description: Post created from prediction
 */
router.post("/post", predictionController.createPostByPrediction);

/**
 * @swagger
 * /api/prediction:
 *   get:
 *     summary: Get all predictions
 *     tags: [Predictions]
 *     responses:
 *       200:
 *         description: List of predictions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prediction'
 */
router.get("/", predictionController.getAllPredictions);

export = router;
