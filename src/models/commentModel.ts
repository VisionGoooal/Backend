import mongoose, { Schema, Model } from "mongoose";

// Define an interface for the Comment document
export interface IComment {
  content: string;
  postId: { type: Schema.Types.ObjectId; ref: "Post" };
  owner: { type: Schema.Types.ObjectId; ref: "User" };
}

// Define the schema
const commentSchema: Schema = new Schema({
  content: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId , ref : "Post", required: true },
  owner: { type: Schema.Types.ObjectId , ref : 'User', required: true },
});

// Create the model
const CommentModel: Model<IComment> = mongoose.model<IComment>(
  "Comment",
  commentSchema
);

export default CommentModel;
