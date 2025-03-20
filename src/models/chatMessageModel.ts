import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const chatMessageSchema: Schema = new Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const ChatMessage: Model<IChatMessage> = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);
export default ChatMessage;