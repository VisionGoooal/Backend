import mongoose, { Schema, Model } from "mongoose";
import commentModel from "./commentModel";

// Define the interface for the Post document
export interface IPost {
  title?: string; // ← הוספנו title כאופציונלי
  content: string;
  owner: { type: Schema.Types.ObjectId; ref: "User" };
  likes: [{ type: Schema.Types.ObjectId; ref: "User" }];
  createdAt: Date;
  image?: string; // Optional field for image
}

// Define the schema for the posts collection
const postSchema: Schema = new Schema({
  title: { type: String, default: "" }, // ← הוספנו title לסכימה
  content: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  image: { type: String, default: null }, // Optional image field
  
},{
  timestamps: true
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
