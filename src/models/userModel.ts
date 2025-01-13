import mongoose, { Schema, Model } from "mongoose";

export interface Iuser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
}

const userSchema: Schema = new Schema({
email: {
    type: String,
    required: true, 
    unique: true
},
password: { type: String, required: true },

refreshToken: { 
  type: [String],
  default: [],
},
});

const userModel: Model<Iuser> = mongoose.model<Iuser>("users", userSchema);

export default userModel;
