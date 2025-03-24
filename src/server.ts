import http from "http";
import https from 'https'
import { Server } from "socket.io";
import cron from "node-cron";
import dotenv from "dotenv";
import { createPredictionsAutomatically } from "./controllers/predictionController";
import appPromise from "./app";
import { socketHandler } from "./socket/socket"; // ✅ Import modular socket handler
import fs from 'fs'
import path from 'path';


dotenv.config();
const port = Number(process.env.PORT) || 80;
appPromise.then((app) => {
  if(process.env.NODE_ENV === "dev"){
  const server = http.createServer(app);
  server.listen(port, () =>
    console.log(`🚀 Server running on port ${port} with Socket.io`));
  const io = new Server(server, { cors: { origin: "*" } });
  socketHandler(io);


  }else{
    const prop = {
      key: fs.readFileSync(path.resolve(__dirname, '../client-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../client-cert.pem'))
    };
   const  httpsServer = https.createServer(prop,app)
   httpsServer.listen(port , '0.0.0.0' , () =>{
      console.log(`🚀 Server running on port ${port} with Socket.io`)});
      const io = new Server(httpsServer, { cors: { origin: "*" } });
      socketHandler(io);


  }
  // ✅ Initialize Socket.io

  // ✅ Handle Socket.io connections in a separate file

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
 
});