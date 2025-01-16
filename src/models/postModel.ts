import mongoose, { Schema, Model } from "mongoose";
import commentModel from "./commentModel";

// Define the interface for the Post document
export interface IPost {
  title: string;
  content: string;
  owner: string;
  likes: number;
}

// Define the schema for the posts collection
const postSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: String, required: true },
  likes: { type: Number, default: 0 },
});

// Pre-remove hook to delete associated comments
postSchema.pre('findOneAndDelete', async function (next) {
  const postId = this.getQuery()["_id"];
  await commentModel.deleteMany({ postId });
  next();
});

// Create the Mongoose model for the Post schema
const PostModel: Model<IPost> = mongoose.model<IPost>("posts", postSchema);

export default PostModel;
