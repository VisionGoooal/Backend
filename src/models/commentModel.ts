import mongoose, { Schema, Model } from "mongoose";

// Define an interface for the Comment document
export interface IComment {
  content: string;
  postId: string;
  owner: string;
}

// Define the schema
const commentSchema: Schema = new Schema({
  content: { type: String, required: true },
  postId: { type: String, required: true },
  owner: { type: String, required: true },
});

// Create the model
const CommentModel: Model<IComment> = mongoose.model<IComment>(
  "Comment",
  commentSchema
);

export default CommentModel;
