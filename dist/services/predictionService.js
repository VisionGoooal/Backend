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
exports.createPromptForMatches = exports.fetchUpcomingMatches = exports.deleteAllPredictions = exports.generatePrediction = void 0;
const openai_1 = __importDefault(require("openai"));
const axios_1 = __importDefault(require("axios"));
const predictionModel_1 = __importDefault(require("../models/predictionModel"));
const generatePrediction = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // Create an instance of the OpenAI API
        const openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY, // The API key for the OpenAI Gemini API
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", // The base URL for the OpenAI API
        });
        // Send the prompt to the API
        const response = yield openai.chat.completions.create({
            model: "gemini-1.5-flash", // The model to use for generating predictions
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }, // The prompt to generate a prediction
            ],
        });
        console.log("Response from API:", response);
        if (!response.choices || !response.choices[0].message) {
            throw new Error("No valid response from API");
        }
        const messageContent = (_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        if (!messageContent) {
            throw new Error("No valid message content from API");
        }
        return messageContent.trim();
    }
    catch (error) {
        console.error("Error generating prediction:", error);
        throw error;
    }
});
exports.generatePrediction = generatePrediction;
const deleteAllPredictions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Delete all predictions from the database
        yield predictionModel_1.default.deleteMany();
        console.log("Yesterday predictions deleted successfully");
        return;
    }
    catch (error) {
        console.error("Error deleting predictions:", error);
        throw error;
    }
});
exports.deleteAllPredictions = deleteAllPredictions;
const fetchUpcomingMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY; // Key for football-data.org API
    const apiUrl = 'https://api.football-data.org/v4/matches'; // URL for football-data.org API today matches
    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    const fromDate = currentDate.toISOString().split('T')[0];
    const toDate = tomorrow.toISOString().split('T')[0];
    try {
        // Fetch upcoming matches from the API
        const response = yield axios_1.default.get(apiUrl, {
            headers: {
                'X-Auth-Token': apiKey,
            },
            params: {
                dateFrom: fromDate,
                dateTo: toDate
            }
        });
        response.data.matches.map((match) => {
            match.utcDate = match.utcDate.split('T')[0];
        });
        return response.data.matches;
    }
    catch (error) {
        console.error('Error fetching upcoming matches:', error);
        return [];
    }
});
exports.fetchUpcomingMatches = fetchUpcomingMatches;
const createPromptForMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch upcoming matches
    const matches = yield (0, exports.fetchUpcomingMatches)();
    // Create an array with match details
    const matchDetails = matches
        .map((match) => `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.utcDate}`)
        .join("\n");
    if (!matchDetails) {
        const prompt = `You are a football match prediction expert. Based on your analysis of recent team performance, historical data, and current form, provide predictions for the following matches in a precise JSON format.
      Please return only the JSON object without any additional text, disclaimers etc.
  
  
      Rules for predictions:
      1. Scores should be realistic (typically 0-5 goals per team)
      2. Winner must be exactly one of: Team1, Team2, or "Draw"
      3. Team names must match exactly as provided
      4. Date format must be YYYY-MM-DD
      5. All fields are required
      
      Please provide predictions in the following JSON format, matching the IPrediction interface:
      
      {
          "predictions": [
              {
                  "Team1": "TeamNameHere",
                  "Team2": "OpponentNameHere",
                  "Team1Score": x,
                  "Team2Score": y,
                  "Winner": "The name of the winning team/Draw",
                  "Date": "YYYY-MM-DD"
              }
          ]
      }
      
      Matches to predict: generate matches as you like
      
      Provide detailed predictions that consider:
      - Recent team performance
      - Head-to-head history
      - Home/away form
      - Current injuries/suspensions
      - Team tactics and playing style
      
      Return the predictions in valid JSON format that exactly matches the IPrediction interface structure.`;
        return prompt;
    }
    // Create a prompt for the upcoming matches
    const prompt = `You are a football match prediction expert. Based on your analysis of recent team performance, historical data, and current form, provide predictions for the following matches in a precise JSON format.
    Please return only the JSON object without any additional text, disclaimers etc.


    Rules for predictions:
    1. Scores should be realistic (typically 0-5 goals per team)
    2. Winner must be exactly one of: Team1, Team2, or "Draw"
    3. Team names must match exactly as provided
    4. Date format must be YYYY-MM-DD
    5. All fields are required
    
    Please provide predictions in the following JSON format, matching the IPrediction interface:
    
    {
        "predictions": [
            {
                "Team1": "TeamNameHere",
                "Team2": "OpponentNameHere",
                "Team1Score": x,
                "Team2Score": y,
                "Winner": "The name of the winning team/Draw",
                "Date": "YYYY-MM-DD"
            }
        ]
    }
    
    Matches to predict:
    ${matchDetails}
    
    Provide detailed predictions that consider:
    - Recent team performance
    - Head-to-head history
    - Home/away form
    - Current injuries/suspensions
    - Team tactics and playing style
    
    Return the predictions in valid JSON format that exactly matches the IPrediction interface structure.`;
    return prompt;
});
exports.createPromptForMatches = createPromptForMatches;
