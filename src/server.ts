import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import dotenv from "dotenv";
import { createPredictionsAutomatically } from "./controllers/predictionController";
import appPromise from "./app";
import { socketHandler } from "./socket/socket"; // ✅ Import modular socket handler

dotenv.config();
const PORT = process.env.PORT || 5000;

appPromise.then((app) => {
  const server = http.createServer(app);

  // ✅ Initialize Socket.io
  const io = new Server(server, { cors: { origin: "*" } });

  // ✅ Handle Socket.io connections in a separate file
  socketHandler(io);

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
  server.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT} with Socket.io`)
  );
});
