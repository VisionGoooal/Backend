import mongoose, { Schema, Model, Document } from "mongoose";


// Define User Interface
interface IUser extends Document {
  _id: string;
  userFullName: string;
  email: string;
  password?: string;
  profileImage?: string;
  refreshToken?: string[]; // ✅ Changed to an array from second model
  country: string;
  dateOfBirth: Date;
  postsHistory: mongoose.Types.ObjectId[]; // ✅ Reference to posts
}

// Define User Schema
const userSchema: Schema = new Schema(
  {
    userFullName: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profileImage: { type: String, default:"../../../Frontend/src/assets/man.png" },
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
