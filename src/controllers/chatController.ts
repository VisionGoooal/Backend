import { Request, Response } from "express";
import mongoose from "mongoose";
import ChatMessage from "../models/chatMessageModel";

/**
 * 📌 Send a Chat Message
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiver, message } = req.body;
    const sender = new mongoose.Types.ObjectId((req as any).user.id);

    if (!receiver || !message) {
      res.status(400).json({ message: "Receiver and message content are required" });
      return;
    }

    const chatMessage = await ChatMessage.create({ sender, receiver, message });
    res.status(201).json(chatMessage);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

/**
 * 📌 Get Chat Messages Between Two Users
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).user.id);
    const otherUserId = new mongoose.Types.ObjectId(req.params.userId);

    const messages = await ChatMessage.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};