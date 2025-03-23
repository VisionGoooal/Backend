import { Server, Socket } from "socket.io";
import { ChatMessage } from "../models/chatMessageModel"; // 🔄 Adjusted path if needed
import mongoose from "mongoose";

export const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("✅ User connected:", socket.id);

    // 🔹 Join room based on user ID (for private messaging)
    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their room`);
    });

    // 🔹 Handle real-time message sending
    socket.on("sendMessage", async ({ sender, receiver, message }) => {
      try {
        if (!sender || !receiver || !message) return;

        const newMessage = await ChatMessage.create({
          sender: new mongoose.Types.ObjectId(sender),
          receiver: new mongoose.Types.ObjectId(receiver),
          content: message, // ✅ fixed
        });

        // 🔁 Emit to both sender and receiver rooms
        io.to(receiver).emit("receiveMessage", newMessage);
        io.to(sender).emit("messageSent", newMessage);
      } catch (err) {
        console.error("❌ Error saving or sending message:", err);
      }
    });

    // 🔌 Handle disconnect
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};
