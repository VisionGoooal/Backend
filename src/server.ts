import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import dotenv from "dotenv";
import { createPredictionsAutomatically } from "./controllers/predictionController";
import ChatMessage from "./models/chatMessageModel";
import appPromise from "./app";

dotenv.config();
const PORT = process.env.PORT || 5000;

appPromise.then((app) => {
  const server = http.createServer(app);

  // ✅ Initialize Socket.io
  const io = new Server(server, { cors: { origin: "*" } });

  // ✅ Socket.io Logic
  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    socket.on("sendMessage", async (data) => {
      try {
        const { userId, username, message } = data;
        if (!userId || !username || !message) return;

        const chatMessage = await ChatMessage.create({ user: userId, username, message });
        io.emit("receiveMessage", chatMessage);
      } catch (error) {
        console.error("❌ Error saving chat message:", error);
      }
    });

    socket.on("disconnect", () => console.log(`🔴 User disconnected: ${socket.id}`));
  });

  // ✅ Schedule AI Match Predictions (Every Day at 6 AM)
  cron.schedule("0 6 * * *", async () => {
    try {
      console.log("🔄 Running daily AI prediction task...");
      await createPredictionsAutomatically();
      console.log("✅ Daily match predictions generated.");
    } catch (error) {
      console.error("❌ Error generating predictions:", error);
    }
  });

  // ✅ Start the Server
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} with Socket.io`));
});
