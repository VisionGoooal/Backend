import express from "express";
import predictionController from "../controllers/prediction_controller";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

router.post("/post", predictionController.createPostByPrediction);


export = router;