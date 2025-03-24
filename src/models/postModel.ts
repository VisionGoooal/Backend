import mongoose, { Schema, Model } from "mongoose";
import commentModel from "./commentModel";

// Define the interface for the Post document
export interface IPost {
  content: string;
  owner: { type: Schema.Types.ObjectId; ref: "User" };
  likes: number;
  image?: string; // Optional field for image
}

// Define the schema for the posts collection
const postSchema: Schema = new Schema({
  content: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId , ref : 'User', required: true },
  likes: { type: Number, default: 0 },
  image: { type: String, default: null }, // Optional image field
});

// Pre-remove hook to delete associated comments when a post is deleted
postSchema.pre("findOneAndDelete", async function (next) {
  const postId = this.getQuery()["_id"];
  await commentModel.deleteMany({ postId });
  next();
});

// Create the Mongoose model for the Post schema
const PostModel: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default PostModel;
