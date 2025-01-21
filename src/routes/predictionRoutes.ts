import express from "express";
import predictionController from "../controllers/prediction_controller";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();


router.post("/", predictionController.createPredictionsAutomatically);
router.post("/post", predictionController.createPostByPrediction);
router.get("/", predictionController.getAllPredictions);


export = router;