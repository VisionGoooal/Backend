import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);
