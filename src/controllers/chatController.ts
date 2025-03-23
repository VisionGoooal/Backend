import { Request, Response } from "express";
import { ChatMessage } from "../models/chatMessageModel";
import mongoose from "mongoose";

// 🔹 GET /api/chat/:userId - fetch messages between logged-in user and another
export const getMessages = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  // const userId = req.user._id;
  // const otherUserId = req.params.userId;

  try {
    const messages = await ChatMessage.find({
      $or: [
        // { sender: userId, receiver: otherUserId },
        // { sender: otherUserId, receiver: userId },
      ],
    }).sort({ timestamp: 1 }); // Oldest to newest

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

// 🔹 POST /api/chat - send message
export const sendMessage = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  // const sender = req.user._id;
  const { receiver, content } = req.body;

  if (!receiver || !content) {
     res.status(400).json({ message: "Missing fields" });
     return;  
  }

  try {
    const newMessage = await ChatMessage.create({
      // sender: new mongoose.Types.ObjectId(sender),
      receiver: new mongoose.Types.ObjectId(receiver),
      content,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Server error sending message" });
  }
};
