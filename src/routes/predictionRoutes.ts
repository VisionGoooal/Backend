import express from "express";
import predictionController from "../controllers/predictionController";
// import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", predictionController.createPredictionsAutomatically);
router.post("/post", predictionController.createPostByPrediction);
router.get("/", predictionController.getAllPredictions);

export = router;
