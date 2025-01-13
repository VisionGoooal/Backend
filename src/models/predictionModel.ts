export interface IPrediction {
    Team1: string;
    Team2: string;
    Team1Score: number;
    Team2Score: number;
    Winner: string;
    Date: string;

}

import mongoose, { Schema, Model } from "mongoose";

const predictionSchema: Schema = new Schema({
    Team1: { type: String, required: true },
    Team2: { type: String, required: true },
    Team1Score: { type: Number, required: true },
    Team2Score: { type: Number, required: true },
    Winner: { type: String, required: true },
    Date: { type: String, required: true },
});

const predictionModel: Model<IPrediction> = mongoose.model<IPrediction>("predictions", predictionSchema);


export default predictionModel;