import OpenAI from 'openai';
import axios from 'axios';
import exp from 'constants';
import predictionModel from '../models/predictionModel';


export const generatePrediction = async (prompt: string): Promise<string> => {
  try {

    // Create an instance of the OpenAI API
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,  // The API key for the OpenAI Gemini API
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", // The base URL for the OpenAI API
    });

    // Send the prompt to the API
    const response = await openai.chat.completions.create({
      model: "gemini-1.5-flash",  // The model to use for generating predictions
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },  // The prompt to generate a prediction
      ],
    });


    // console.log("Response from API:", response);

    if (!response.choices || !response.choices[0].message) {
      throw new Error("No valid response from API");
    }


    const messageContent = response.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No valid message content from API");
    }
    return messageContent.trim();
  } catch (error) {
    console.error("Error generating prediction:", error);
    throw error;
  }
};

export const deleteAllPredictions = async () => {
  try {
    // Delete all predictions from the database
    await predictionModel.deleteMany();
    // console.log("Yesterday predictions deleted successfully");
    return;
  } catch (error) {
    console.error("Error deleting predictions:", error);
    throw error;
  }
}



interface Team {
  name: string;
}

interface Match {
  homeTeam: Team;
  awayTeam: Team;
  utcDate: string;
}

interface ApiResponse {
  matches: Match[];
}



export const fetchUpcomingMatches = async (): Promise<Match[]> => {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY; // Key for football-data.org API
  const apiUrl = 'https://api.football-data.org/v4/matches'; // URL for football-data.org API today matches
  
  const currentDate = new Date();

  const tomorrow = new Date(currentDate);
  tomorrow.setDate(currentDate.getDate() + 1);
  
  const fromDate = currentDate.toISOString().split('T')[0];
  const toDate = tomorrow.toISOString().split('T')[0];
  
  try {
    // Fetch upcoming matches from the API
    const response = await axios.get<ApiResponse>(apiUrl, {
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
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return [];
  }
};

export const createPromptForMatches = async (): Promise<string> => {
  // Fetch upcoming matches
  const matches = await fetchUpcomingMatches();

  // Create an array with match details
  const matchDetails = matches
    .map((match) => `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.utcDate}`)
    .join("\n");

    if(!matchDetails) {
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
}