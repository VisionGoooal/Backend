"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const predictionController_1 = __importDefault(require("../controllers/predictionController"));
// import { protect } from "../middleware/authMiddleware";
const router = express_1.default.Router();
router.post("/", predictionController_1.default.createPredictionsAutomatically);
router.post("/post", predictionController_1.default.createPostByPrediction);
router.get("/", predictionController_1.default.getAllPredictions);
module.exports = router;
