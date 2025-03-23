import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  userFullName: string;
  email: string;
  password?: string;
  profileImage?: string;
  refreshToken?: string[];
  country: string;
  dateOfBirth: Date;
  postsHistory: Types.ObjectId[];
}


// Define User Schema
const userSchema: Schema = new Schema(
  {
    userFullName: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profileImage: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg",
    },
    refreshToken: { type: [String], default: [] }, // ✅ Updated to an array
    dateOfBirth: { type: Date, default: new Date("2000-01-01") },
    country: { type: String, default: "Unknown" },
    postsHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // ✅ Link to posts
  },
  { timestamps: true }
);

// Create User Model
const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default UserModel;
