"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostByPrediction = exports.createPredictionsAutomatically = exports.getAllPredictions = void 0;
const predictionService_1 = require("../services/predictionService");
const predictionModel_1 = __importDefault(require("../models/predictionModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
const node_cron_1 = __importDefault(require("node-cron"));
const getAllPredictions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const predictions = yield predictionModel_1.default.find();
        res.status(200).json(predictions);
    }
    catch (error) {
        console.error("Error getting predictions:", error);
        res.status(500).json({ message: "An error occurred while getting predictions" });
    }
});
exports.getAllPredictions = getAllPredictions;
// Function to create predictions automatically
const createPredictionsAutomatically = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, predictionService_1.deleteAllPredictions)();
        // Create a prompt for the upcoming matches
        const prompt = yield (0, predictionService_1.createPromptForMatches)();
        if (!prompt) {
            throw new Error('No prompt created');
        }
        // Generate predictions based on the prompt
        let gptResponseString = yield (0, predictionService_1.generatePrediction)(prompt);
        gptResponseString = gptResponseString.trim()
            .replace(/^```json\s*\n|\n```$/g, '');
        const gptResponse = JSON.parse(gptResponseString);
        // console.log('Prediction received:', gptResponse);
        if (!gptResponse) {
            throw new Error('No prediction received');
        }
        // Loop through the predictions and save them to the database
        for (const prediction of gptResponse.predictions) {
            try {
                const predictionData = {
                    Team1: prediction.Team1,
                    Team2: prediction.Team2,
                    Team1Score: prediction.Team1Score,
                    Team2Score: prediction.Team2Score,
                    Winner: prediction.Winner,
                    Date: prediction.Date,
                };
                // Save the prediction to the database
                yield predictionModel_1.default.create(predictionData);
                // console.log('Predictions successfully created');
            }
            catch (error) {
                console.error('Error creating predictions:', error);
            }
        }
    }
    catch (error) {
        console.error('Error generating predictions:', error);
    }
});
exports.createPredictionsAutomatically = createPredictionsAutomatically;
const createPostByPrediction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, owner, image, likes } = req.body;
    const newPost = new postModel_1.default({
        title,
        content,
        owner,
        likes,
        image
    });
    try {
        yield newPost.save();
        res.status(201).json(newPost);
    }
    catch (error) {
        console.error("Error adding post:", error);
        res.status(500).json({ message: "An error occurred while adding the post" });
    }
});
exports.createPostByPrediction = createPostByPrediction;
// Create predictions automatically every day at 6:00 AM
node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prompt = yield (0, exports.createPredictionsAutomatically)();
        // console.log("Generated prompt for matches:", prompt);
    }
    catch (error) {
        console.error("Error generating prompt:", error);
    }
}));
exports.default = { createPostByPrediction: exports.createPostByPrediction, createPredictionsAutomatically: exports.createPredictionsAutomatically, getAllPredictions: exports.getAllPredictions };
