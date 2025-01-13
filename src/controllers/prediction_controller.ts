import predictionModel,{IPrediction} from "../models/predictionModel";
import base_controller from "./base_controller";

const BaseController = new base_controller<IPrediction>(predictionModel);

const { GPT } = require('gpt-3');
const gpt = new GPT({
  apiKey: process.env.OPENAI_API_KEY
});

export const createItem = async (req: any, res: any) => {
    const data = req.body;
    try {
        const prompt = data.prompt;  
        const response = await gpt.complete(prompt);
        const gptResponse = response.choices[0].text;
        const [team1, team2, score, winner, date] = gptResponse.split("\n");

        
        const predictionData = {
            Team1: team1.split(": ")[1],  
            Team2: team2.split(": ")[1],  
            Team1Score: parseInt(score.split(" - ")[0]),  
            Team2Score: parseInt(score.split(" - ")[1]),  
            Winner: winner.split(": ")[1],  
            Date: date.split(": ")[1]  
        };

        const newItem = await predictionModel.create(predictionData);
        res.status(201).send(newItem);
    } catch (error) {
        res.status(400).send(error);
    }
};


export default BaseController




/*
-getAll
-createItem:send prompt to GPT and save the response in the database

-getDataById
-updateItem
-deleteItem

Team 1: Real Madrid
Team 2: Barcelona
Score: Real Madrid 3 - 1 Barcelona
Winner: Real Madrid
Date: 2025-01-13


/*


