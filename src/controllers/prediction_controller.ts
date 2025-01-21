import { generatePrediction, createPromptForMatches } from '../services/predictionService';
import predictionModel from '../models/predictionModel';
import postModel from '../models/postModel';
import cron from 'node-cron';

// Function to create predictions automatically
export const createPredictionsAutomatically = async () => {
  try {
    // Create a prompt for the upcoming matches
    const prompt = await createPromptForMatches();

    // Generate predictions based on the prompt
    let gptResponseString = await generatePrediction(prompt);
    gptResponseString = gptResponseString.replace(/^```json\n|\n```$/g, '');
    const gptResponse = JSON.parse(gptResponseString);

    console.log('Prediction received:', gptResponse);

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
          await predictionModel.create(predictionData)
          
          console.log('Predictions successfully created');
        } catch (error) {
            console.error('Error creating predictions:', error);
             }
    }
  } catch (error) {
    console.error('Error generating predictions:', error);
  }
};


export const createPostByPrediction = async (req: any, res: any) => {
    const { title, content, owner, image, likes } = req.body;
    const newPost = new postModel({
        title,
        content,
        owner,
        likes,
        image
    });
    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error("Error adding post:", error);
        res.status(500).json({ message: "An error occurred while adding the post" });
    }
}


// Create predictions automatically every day at 6:00 AM
cron.schedule('0 6 * * *', async () => {
  try {
    const prompt = await createPredictionsAutomatically();
    console.log("Generated prompt for matches:", prompt);
  } catch (error) {
    console.error("Error generating prompt:", error);
  }
});


export default {createPostByPrediction,createPredictionsAutomatically};


